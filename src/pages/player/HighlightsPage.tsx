import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/layout/PageHeader';
import VideoEmbed from '../../components/common/VideoEmbed';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getMyProfile } from '../../services/playerService';
import { getPlayerStats } from '../../services/statsService';
import type { PlayerStats } from '../../services/statsService';

/**
 * Highlights Page (Player)
 * 
 * Page for players to view their match-specific video highlights.
 * 
 * Features:
 * - Display match-specific highlight videos in a gallery grid
 * - Support for YouTube, Vimeo, VEO, and direct links
 * - Empty state for players without highlights
 * - Loading state while fetching data
 * - Consistent card-based sizing matching scout view
 */
const HighlightsPage: React.FC = () => {
	const { t } = useTranslation();
	const [matchStats, setMatchStats] = useState<PlayerStats[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const profileData = await getMyProfile();

				if (profileData?.player_profile?.id) {
					const stats = await getPlayerStats({
						player: profileData.player_profile.id,
						ordering: '-match__match_date',
						page_size: 100
					});
					// Filter only matches with highlights
					const withHighlights = stats.results.filter(s => s.highlights_video_url);
					setMatchStats(withHighlights);
				}
			} catch (err) {
				console.error('Failed to load highlights:', err);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	const formatDate = (dateString: string | null | undefined) => {
		if (!dateString) return '';
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	return (
		<DashboardLayout>
			<PageHeader
				title={t('player.myHighlights')}
				subtitle={t('player.highlightsSubtitle')}
			/>

			{loading ? (
				<div className="flex items-center justify-center min-h-[400px]">
					<LoadingSpinner size="lg" />
				</div>
			) : matchStats.length === 0 ? (
				<EmptyState
					title={t('player.noHighlightsYet')}
					message="No highlights uploaded yet. Your match highlights will appear here."
					icon={
						<svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
						</svg>
					}
				/>
			) : (
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
							<svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
							</svg>
							{t('players.matchHighlightsGallery')}
						</h2>
						<span className="text-sm text-gray-500">
							{matchStats.length} {matchStats.length === 1 ? 'video' : 'videos'} available
						</span>
					</div>

					{/* Highlights Gallery Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{matchStats.map((match) => (
							<div
								key={match.id || match.match}
								className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
							>
								{/* Card Header */}
								<div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 border-b border-gray-200">
									<div className="flex items-center justify-between mb-2">
										<span className="text-xs font-semibold text-indigo-600 uppercase">
											{match.match_info?.competition || t('matches.match')}
										</span>
										<span className="text-xs text-gray-500">
											{formatDate(match.match_info?.match_date)}
										</span>
									</div>
									{match.match_info && (
										<div className="text-sm font-semibold text-gray-900">
											{match.match_info.home_team} vs {match.match_info.away_team}
										</div>
									)}
								</div>

								{/* Stats Summary */}
								<div className="p-4 bg-white">
									<div className="flex justify-around mb-4">
										<div className="text-center">
											<p className="text-2xl font-bold text-indigo-600">{match.goals || 0}</p>
											<p className="text-xs text-gray-500">{t('stats.goals')}</p>
										</div>
										<div className="text-center">
											<p className="text-2xl font-bold text-purple-600">{match.assists || 0}</p>
											<p className="text-xs text-gray-500">{t('stats.assists')}</p>
										</div>
										<div className="text-center">
											<p className="text-2xl font-bold text-gray-700">{match.minutes_played || 0}</p>
											<p className="text-xs text-gray-500">{t('stats.minutes')}</p>
										</div>
									</div>

									{/* Video Embed */}
									{match.highlights_video_url && (
										<VideoEmbed
											url={match.highlights_video_url}
											title={`${match.match_info?.home_team} vs ${match.match_info?.away_team} - Highlights`}
										/>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</DashboardLayout>
	);
};

export default HighlightsPage;
