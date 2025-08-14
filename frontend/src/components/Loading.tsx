import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../styles/GlobalStyles';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  fullScreen?: boolean;
  message?: string;
}

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const LoadingContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'fullScreen',
})<{ fullScreen?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.md};
  
  ${({ fullScreen }) => fullScreen && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    z-index: 9999;
  `}
`;

const Spinner = styled.div<{ size: string; color: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border: 3px solid ${theme.colors.gray[200]};
  border-top: 3px solid ${({ color }) => color};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingMessage = styled.p`
  color: ${theme.colors.gray[600]};
  font-size: 0.875rem;
  text-align: center;
  margin: 0;
`;

const DotsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
`;

const Dot = styled.div<{ delay: number; color: string }>`
  width: 8px;
  height: 8px;
  background: ${({ color }) => color};
  border-radius: 50%;
  animation: ${keyframes`
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  `} 1.4s infinite ease-in-out both;
  animation-delay: ${({ delay }) => delay}s;
`;

const PulseContainer = styled.div<{ size: string; color: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  position: relative;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: ${({ color }) => color};
    animation: ${keyframes`
      0% {
        transform: scale(0);
        opacity: 1;
      }
      100% {
        transform: scale(1);
        opacity: 0;
      }
    `} 2s infinite;
  }
  
  &::after {
    animation-delay: 1s;
  }
`;

const getSizeValue = (size: string): string => {
  switch (size) {
    case 'sm':
      return '20px';
    case 'lg':
      return '48px';
    default:
      return '32px';
  }
};

export const SpinnerLoading: React.FC<LoadingProps> = ({
  size = 'md',
  color = theme.colors.primary[500],
  fullScreen = false,
  message,
}) => {
  const sizeValue = getSizeValue(size);

  return (
    <LoadingContainer fullScreen={fullScreen}>
      <Spinner size={sizeValue} color={color} />
      {message && <LoadingMessage>{message}</LoadingMessage>}
    </LoadingContainer>
  );
};

export const DotsLoading: React.FC<LoadingProps> = ({
  color = theme.colors.primary[500],
  fullScreen = false,
  message,
}) => {
  return (
    <LoadingContainer fullScreen={fullScreen}>
      <DotsContainer>
        <Dot delay={0} color={color} />
        <Dot delay={0.16} color={color} />
        <Dot delay={0.32} color={color} />
      </DotsContainer>
      {message && <LoadingMessage>{message}</LoadingMessage>}
    </LoadingContainer>
  );
};

export const PulseLoading: React.FC<LoadingProps> = ({
  size = 'md',
  color = theme.colors.primary[500],
  fullScreen = false,
  message,
}) => {
  const sizeValue = getSizeValue(size);

  return (
    <LoadingContainer fullScreen={fullScreen}>
      <PulseContainer size={sizeValue} color={color} />
      {message && <LoadingMessage>{message}</LoadingMessage>}
    </LoadingContainer>
  );
};

// Componente principal de loading
const Loading: React.FC<LoadingProps & { type?: 'spinner' | 'dots' | 'pulse' }> = ({
  type = 'spinner',
  ...props
}) => {
  switch (type) {
    case 'dots':
      return <DotsLoading {...props} />;
    case 'pulse':
      return <PulseLoading {...props} />;
    default:
      return <SpinnerLoading {...props} />;
  }
};

export default Loading;