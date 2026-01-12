import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import Button from './Button';
import Avatar from './Avatar';
import { updateProfile } from '../../services/authService';
import { compressImage, validateImage } from '../../utils/imageCompression';
import { showSuccess, showError } from '../../utils/toast';

/**
 * ProfilePictureUploadModal Component Props
 */
export interface ProfilePictureUploadModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;
  /**
   * Callback when modal should close
   */
  onClose: () => void;
  /**
   * Current profile picture URL
   */
  currentPicture: string | null;
  /**
   * User's name for avatar fallback
   */
  userName?: string;
  /**
   * Callback after successful upload (receives new picture URL)
   */
  onSuccess: (newPictureUrl: string) => void;
}

/**
 * ProfilePictureUploadModal Component
 * 
 * Modal for uploading and managing profile pictures.
 * 
 * Features:
 * - Current picture preview with remove option
 * - Drag and drop file upload
 * - File input with image preview
 * - File validation (type, size)
 * - Image compression before upload
 * - Loading states
 * - Toast notifications
 */
const ProfilePictureUploadModal: React.FC<ProfilePictureUploadModalProps> = ({
  isOpen,
  onClose,
  currentPicture,
  userName = '',
  onSuccess,
}) => {
  const { t } = useTranslation();

  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setError('');
        if (previewUrlRef.current) {
          URL.revokeObjectURL(previewUrlRef.current);
          previewUrlRef.current = null;
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  /**
   * Handle file selection
   */
  const handleFileSelect = async (file: File) => {
    setError('');

    // Validate file
    const validation = validateImage(file, 5);
    if (!validation.isValid) {
      const errorMessage = validation.error === 'common.invalidImageType'
        ? 'Please select a valid image file (JPG, PNG, or WebP)'
        : 'File size must be less than 5MB';
      setError(errorMessage);
      showError(errorMessage);
      return;
    }

    // Check specific formats (JPG, PNG, WebP)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      const errorMessage = 'Only JPG, PNG, and WebP formats are supported';
      setError(errorMessage);
      showError(errorMessage);
      return;
    }

    try {
      // Compress image
      const compressedFile = await compressImage(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
      });

      // Create preview URL
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }

      const preview = URL.createObjectURL(compressedFile);
      previewUrlRef.current = preview;
      setPreviewUrl(preview);
      setSelectedFile(compressedFile);
    } catch (error) {
      console.error('Failed to process image:', error);
      showError('Failed to process image. Please try again.');
    }
  };

  /**
   * Handle file input change
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Handle drag over
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  /**
   * Handle drag leave
   */
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  /**
   * Handle drop
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Handle remove picture
   */
  const handleRemovePicture = async () => {
    if (!currentPicture) return;

    setLoading(true);
    try {
      // Update profile with empty profile_picture
      await updateProfile({ profile_picture: '' });
      showSuccess('Profile picture removed successfully');
      onSuccess('');
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove picture';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle upload
   */
  const handleUpload = async () => {
    if (!selectedFile) {
      showError('Please select an image first');
      return;
    }

    setLoading(true);
    try {
      // Create FormData and send file with correct field name
      const formData = new FormData();
      
      // Ensure file has proper name with extension (compressed files are named "blob")
      const fileExtension = selectedFile.type.split('/')[1] || 'jpg';
      const fileName = selectedFile.name === 'blob' 
        ? `profile_picture.${fileExtension}` 
        : selectedFile.name;
      
      // Create a new File object with the correct name
      const fileWithName = new File([selectedFile], fileName, { type: selectedFile.type });
      
      formData.append('profile_picture', fileWithName);
      
      const updatedUser = await updateProfile(formData);

      showSuccess('Profile picture updated successfully!');
      onSuccess(updatedUser.profile_picture || '');
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload picture';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle browse button click
   */
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('player.changePicture')}
      size="md"
      footer={{
        primary: {
          label: t('player.uploadPicture'),
          onClick: handleUpload,
          variant: 'primary',
          loading: loading,
        },
        secondary: {
          label: t('common.cancel'),
          onClick: handleClose,
          variant: 'outline',
        },
      }}
      closeOnBackdropClick={!loading}
      closeOnEsc={!loading}
    >
      <div className="space-y-6">
        {/* Current Picture Section */}
        {currentPicture && !selectedFile && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              {t('player.profilePicture')}
            </label>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Avatar
                src={currentPicture}
                alt={userName}
                fallback={userName.substring(0, 2).toUpperCase()}
                size="xl"
                border
              />
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  {t('player.removePictureNote')}
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={handleRemovePicture}
                disabled={loading}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                }
              >
                {t('player.removePicture')}
              </Button>
            </div>
          </div>
        )}

        {/* New Picture Preview */}
        {previewUrl && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              {t('player.newPicturePreview')}
            </label>
            <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <Avatar
                src={previewUrl}
                alt="New picture"
                size="xl"
                border
                borderColor="blue-500"
              />
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            {selectedFile ? t('player.changePicture') : t('player.uploadNewPicture')}
          </label>

          {/* Drag and Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={`
              relative
              border-2
              border-dashed
              rounded-lg
              p-8
              text-center
              cursor-pointer
              transition-all
              duration-200
              ${isDragging
                ? 'border-blue-500 bg-blue-50'
                : error
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
              }
              ${loading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileInputChange}
              disabled={loading}
              className="hidden"
            />

            <div className="space-y-3">
              {/* Icon */}
              <div className="flex justify-center">
                <svg
                  className={`w-12 h-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>

              {/* Text */}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {isDragging ? t('player.dropImageHere') : t('player.dragDropImage')}
                </p>
                <p className="text-xs text-gray-500 mt-1">{t('player.clickToBrowse')}</p>
              </div>

              {/* File Info */}
              {selectedFile && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">
                    {selectedFile.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </p>
          )}

          {/* Helper Text */}
          {!error && (
            <div className="text-xs text-gray-500 space-y-1">
              <p>• {t('player.supportedFormats')}</p>
              <p>• {t('player.maxFileSize')}</p>
              <p>• {t('player.recommendedSize')}</p>
            </div>
          )}
        </div>

        {/* Info Note */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-800">
            {t('player.pictureOptimizationNote')}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ProfilePictureUploadModal;

