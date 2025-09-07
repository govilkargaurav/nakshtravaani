import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { setAuth } from '../utils/auth';

const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await authAPI.login(values);
      const { admin, tokens } = response.data.data;
      
      setAuth(admin, tokens.accessToken);
      message.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      message.error(error.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-form">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <StarOutlined style={{ fontSize: '48px', color: '#722ed1', marginBottom: '16px' }} />
          <Title level={2} style={{ margin: 0 }}>
            Nakshatravani Astrology
          </Title>
          <p style={{ color: '#666', marginTop: '8px' }}>
            Sign in to manage your astrology platform
          </p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: '45px' }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', color: '#666', fontSize: '12px', marginTop: '24px' }}>
          Default credentials: admin / admin123
        </div>
      </Card>
    </div>
  );
};

export default Login;