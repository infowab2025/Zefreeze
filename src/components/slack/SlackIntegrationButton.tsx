import React from 'react';
import { Link } from 'react-router-dom';
import { Slack } from 'lucide-react';

interface SlackIntegrationButtonProps {
  className?: string;
}

const SlackIntegrationButton: React.FC<SlackIntegrationButtonProps> = ({ className = '' }) => {
  return (
    <Link
      to="/dashboard/messages/slack"
      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4A154B] hover:bg-opacity-90 ${className}`}
    >
      <Slack className="h-4 w-4 mr-2" />
      Intégration Slack
    </Link>
  );
};

export default SlackIntegrationButton;