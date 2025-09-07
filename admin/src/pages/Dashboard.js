import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Spin, message } from 'antd';
import {
  UsergroupAddOutlined,
  UserAddOutlined,
  EyeOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardAPI } from '../services/api';
import moment from 'moment';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);
  const [horoscopeStats, setHoroscopeStats] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getStats();
      const { stats, recentUsers, horoscopeStats } = response.data.data;
      
      setStats(stats);
      setRecentUsers(recentUsers);
      setHoroscopeStats(horoscopeStats);
    } catch (error) {
      message.error('Failed to fetch dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const userColumns = [
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Name',
      key: 'name',
      render: (record) => (
        record.profile?.firstName ? 
        `${record.profile.firstName} ${record.profile.lastName || ''}`.trim() : 
        'Not set'
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isVerified',
      key: 'status',
      render: (isVerified) => (
        <Tag color={isVerified ? 'green' : 'orange'}>
          {isVerified ? 'Verified' : 'Pending'}
        </Tag>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Last Active',
      dataIndex: 'lastActive',
      key: 'lastActive',
      render: (date) => date ? moment(date).fromNow() : 'Never',
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  const chartData = horoscopeStats.map(item => ({
    date: moment(item.date).format('MM/DD'),
    count: parseInt(item.count)
  }));

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UsergroupAddOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Verified Users"
              value={stats.totalVerifiedUsers}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Today's Registrations"
              value={stats.todayRegistrations}
              prefix={<UserAddOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Daily Active Users"
              value={stats.dailyActiveUsers}
              prefix={<EyeOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Horoscope Views (Last 7 Days)">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#722ed1" 
                  strokeWidth={2}
                  dot={{ fill: '#722ed1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="Recent Users" 
            extra={
              <span style={{ color: '#666', fontSize: '14px' }}>
                Today's Horoscope Views: {stats.todayHoroscopeViews}
              </span>
            }
          >
            <Table
              dataSource={recentUsers}
              columns={userColumns}
              pagination={false}
              size="small"
              rowKey="_id"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;