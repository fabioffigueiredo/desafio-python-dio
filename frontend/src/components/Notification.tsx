import React from 'react';
import styled from 'styled-components';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Notification as NotificationType } from '../types';
import { theme } from '../styles/GlobalStyles';
import { useNotification } from '../hooks/useNotification';

interface NotificationProps {
  notification: NotificationType;
}

const NotificationContainer = styled.div<{ type: NotificationType['type'] }>`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.lg};
  background: ${theme.colors.white};
  border-left: 4px solid;
  animation: slideIn 0.3s ease-out;
  max-width: 400px;
  
  ${({ type }) => {
    switch (type) {
      case 'success':
        return `border-left-color: ${theme.colors.success[500]};`;
      case 'error':
        return `border-left-color: ${theme.colors.error[500]};`;
      case 'warning':
        return `border-left-color: ${theme.colors.warning[500]};`;
      case 'info':
        return `border-left-color: ${theme.colors.primary[500]};`;
      default:
        return `border-left-color: ${theme.colors.gray[500]};`;
    }
  }}
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const IconContainer = styled.div<{ type: NotificationType['type'] }>`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  
  ${({ type }) => {
    switch (type) {
      case 'success':
        return `color: ${theme.colors.success[500]};`;
      case 'error':
        return `color: ${theme.colors.error[500]};`;
      case 'warning':
        return `color: ${theme.colors.warning[500]};`;
      case 'info':
        return `color: ${theme.colors.primary[500]};`;
      default:
        return `color: ${theme.colors.gray[500]};`;
    }
  }}
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin: 0 0 ${theme.spacing.xs} 0;
`;

const Message = styled.p`
  font-size: 0.875rem;
  color: ${theme.colors.gray[600]};
  margin: 0;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  color: ${theme.colors.gray[400]};
  cursor: pointer;
  border-radius: ${theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: ${theme.colors.gray[600]};
    background: ${theme.colors.gray[100]};
  }
`;

const getIcon = (type: NotificationType['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle size={24} />;
    case 'error':
      return <AlertCircle size={24} />;
    case 'warning':
      return <AlertTriangle size={24} />;
    case 'info':
      return <Info size={24} />;
    default:
      return <Info size={24} />;
  }
};

export const NotificationItem: React.FC<NotificationProps> = ({ notification }) => {
  const { removeNotification } = useNotification();

  const handleClose = () => {
    removeNotification(notification.id);
  };

  return (
    <NotificationContainer type={notification.type}>
      <IconContainer type={notification.type}>
        {getIcon(notification.type)}
      </IconContainer>
      
      <Content>
        <Title>{notification.title}</Title>
        <Message>{notification.message}</Message>
      </Content>
      
      <CloseButton onClick={handleClose}>
        <X size={16} />
      </CloseButton>
    </NotificationContainer>
  );
};

const NotificationListContainer = styled.div`
  position: fixed;
  top: ${theme.spacing.xl};
  right: ${theme.spacing.xl};
  z-index: 1000;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    top: ${theme.spacing.md};
    right: ${theme.spacing.md};
    left: ${theme.spacing.md};
  }
`;

export const NotificationList: React.FC = () => {
  const { notifications } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <NotificationListContainer>
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </NotificationListContainer>
  );
};

export default NotificationList;