import React from 'react';

interface StatCardProps {
	label: string;
	value: string | number;
	small?: boolean;
	highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
	label, 
	value, 
	small = false, 
	highlight = false 
}) => {
	return (
		<div className={`
			${small ? 'p-3' : 'p-4'} 
			${highlight 
				? 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300' 
				: 'bg-gray-50 border border-gray-200'
			}
			rounded-lg text-center transition-all hover:shadow-md
		`}>
			<div className={`${small ? 'text-xl' : 'text-3xl'} font-bold ${
				highlight ? 'text-blue-700' : 'text-gray-900'
			} mb-1`}>
				{value}
			</div>
			<div className={`${small ? 'text-xs' : 'text-sm'} ${
				highlight ? 'text-blue-600 font-medium' : 'text-gray-600'
			}`}>
				{label}
			</div>
		</div>
	);
};

export default StatCard;

