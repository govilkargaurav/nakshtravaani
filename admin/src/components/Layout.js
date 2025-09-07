import React from 'react';
import { Layout as AntLayout, Menu, Button, Typography, Avatar } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UsergroupAddOutlined,
  BookOutlined,
  LogoutOutlined,
  StarOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import { clearAuth, getStoredUser } from '../utils/auth';

const { Header, Sider, Content } = AntLayout;
const { Title } = Typography;

const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/users',
      icon: <UsergroupAddOutlined />,
      label: 'Users',
    },
    {
      key: '/horoscopes',
      icon: <BookOutlined />,
      label: 'Horoscopes',
    },
    {
      key: '/horoscope-reader',
      icon: <ReadOutlined />,
      label: 'Horoscope Reader',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        width={250}
        style={{
          background: '#001529',
        }}
      >
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <StarOutlined style={{ fontSize: '32px', color: '#722ed1', marginBottom: '10px' }} />
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            Nakshatravani
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          theme="dark"
        />
      </Sider>
      <AntLayout>
        <Header className="dashboard-header">
          <Title level={3} style={{ margin: 0, color: '#722ed1' }}>
            Nakshatravani Astrology - Admin Panel
          </Title>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Avatar style={{ backgroundColor: '#722ed1' }}>
                {user?.username?.charAt(0)?.toUpperCase()}
              </Avatar>
              <span>Welcome, {user?.username}</span>
            </div>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </Header>
        <Content style={{ margin: '24px', background: '#f0f2f5' }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default AppLayout;