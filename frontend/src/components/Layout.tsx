import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  CreditCard,
  ArrowUpDown,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Bell,
} from 'lucide-react';
import { theme } from '../styles/GlobalStyles';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils';

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${theme.colors.gray[50]};
`;

const Sidebar = styled.aside<{ $isOpen: boolean }>`
  width: 280px;
  background: ${theme.colors.white};
  border-right: 1px solid ${theme.colors.gray[200]};
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
  transition: transform 0.3s ease-in-out;
  
  @media (max-width: ${theme.breakpoints.lg}) {
    transform: translateX(${({ $isOpen }) => $isOpen ? '0' : '-100%'});
  }
`;

const SidebarHeader = styled.div`
  padding: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.gray[200]};
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  font-size: 1.5rem;
  font-weight: 700;
  color: ${theme.colors.primary[600]};
`;

const Navigation = styled.nav`
  flex: 1;
  padding: ${theme.spacing.lg};
`;

const NavItem = styled(Link)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  color: ${({ $isActive }) => $isActive ? theme.colors.primary[600] : theme.colors.gray[600]};
  background: ${({ $isActive }) => $isActive ? theme.colors.primary[50] : 'transparent'};
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background: ${({ $isActive }) => $isActive ? theme.colors.primary[50] : theme.colors.gray[50]};
    color: ${({ $isActive }) => $isActive ? theme.colors.primary[600] : theme.colors.gray[900]};
  }
`;

const SidebarFooter = styled.div`
  padding: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.gray[200]};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: ${theme.colors.primary[100]};
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.primary[600]};
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  font-size: 0.875rem;
`;

const UserCPF = styled.div`
  font-size: 0.75rem;
  color: ${theme.colors.gray[500]};
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  width: 100%;
  padding: ${theme.spacing.md};
  background: none;
  border: none;
  color: ${theme.colors.gray[600]};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    background: ${theme.colors.gray[50]};
    color: ${theme.colors.gray[900]};
  }
`;

const MainContent = styled.main<{ $sidebarOpen: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 280px;
  
  @media (max-width: ${theme.breakpoints.lg}) {
    margin-left: 0;
  }
`;

const Header = styled.header`
  background: ${theme.colors.white};
  border-bottom: 1px solid ${theme.colors.gray[200]};
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${theme.colors.gray[600]};
  cursor: pointer;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  
  &:hover {
    background: ${theme.colors.gray[100]};
  }
  
  @media (max-width: ${theme.breakpoints.lg}) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const PageTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${theme.colors.gray[900]};
  margin: 0;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const NotificationButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.gray[600]};
  cursor: pointer;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  position: relative;
  
  &:hover {
    background: ${theme.colors.gray[100]};
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: ${theme.spacing.xl};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing.lg};
  }
`;

const Overlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  display: ${({ $isVisible }) => $isVisible ? 'block' : 'none'};
  
  @media (min-width: ${theme.breakpoints.lg}) {
    display: none;
  }
`;

const navigationItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/operacoes', label: 'Operações', icon: ArrowUpDown },
  { path: '/extrato', label: 'Extrato', icon: FileText },
  { path: '/contas', label: 'Contas', icon: CreditCard },
  { path: '/configuracoes', label: 'Configurações', icon: Settings },
];

const getPageTitle = (pathname: string): string => {
  const item = navigationItems.find(item => item.path === pathname);
  return item?.label || 'DIO Bank';
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <LayoutContainer>
      <Overlay $isVisible={sidebarOpen} onClick={closeSidebar} />
      
      <Sidebar $isOpen={sidebarOpen}>
        <SidebarHeader>
          <Logo>
            <CreditCard size={32} />
            DIO Bank
          </Logo>
        </SidebarHeader>
        
        <Navigation>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavItem
                key={item.path}
                to={item.path}
                $isActive={isActive}
                onClick={closeSidebar}
              >
                <Icon size={20} />
                {item.label}
              </NavItem>
            );
          })}
        </Navigation>
        
        <SidebarFooter>
          {user && (
            <UserInfo>
              <UserAvatar>
                <User size={20} />
              </UserAvatar>
              <UserDetails>
                <UserName>{user.nome}</UserName>
                <UserCPF>CPF: {user.cpf}</UserCPF>
              </UserDetails>
            </UserInfo>
          )}
          
          <LogoutButton onClick={handleLogout}>
            <LogOut size={20} />
            Sair
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>
      
      <MainContent $sidebarOpen={sidebarOpen}>
        <Header>
          <HeaderLeft>
            <MenuButton onClick={toggleSidebar}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </MenuButton>
            <PageTitle>{getPageTitle(location.pathname)}</PageTitle>
          </HeaderLeft>
          
          <HeaderRight>
            <NotificationButton>
              <Bell size={20} />
            </NotificationButton>
          </HeaderRight>
        </Header>
        
        <ContentArea>
          {children}
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;