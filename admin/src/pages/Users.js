import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Input,
  Select,
  Space,
  Tag,
  Button,
  Modal,
  Descriptions,
  Avatar,
  message,
  Row,
  Col,
} from 'antd';
import { SearchOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons';
import { usersAPI } from '../services/api';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize, searchText, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText,
        isVerified: statusFilter,
      };
      
      const response = await usersAPI.getAll(params);
      const { users, pagination: paginationData } = response.data.data;
      
      setUsers(users);
      setPagination(prev => ({
        ...prev,
        total: paginationData.total,
      }));
    } catch (error) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserDetails = async (userId) => {
    try {
      const response = await usersAPI.getById(userId);
      const { user, stats } = response.data.data;
      setSelectedUser({ ...user, stats });
      setModalVisible(true);
    } catch (error) {
      message.error('Failed to fetch user details');
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const columns = [
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          {phone}
        </Space>
      ),
    },
    {
      title: 'Name',
      key: 'name',
      render: (record) => {
        const { profile } = record;
        return profile?.firstName ? 
          `${profile.firstName} ${profile.lastName || ''}`.trim() : 
          <span style={{ color: '#999' }}>Not set</span>;
      },
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
      title: 'Sun Sign',
      key: 'sunSign',
      render: (record) => (
        record.birthChart?.sunSign ? 
        <Tag color="purple">{record.birthChart.sunSign}</Tag> : 
        <span style={{ color: '#999' }}>-</span>
      ),
    },
    {
      title: 'Subscription',
      dataIndex: 'subscription',
      key: 'subscription',
      render: (subscription) => (
        <Tag color={subscription?.type === 'premium' ? 'gold' : subscription?.type === 'pro' ? 'purple' : 'default'}>
          {subscription?.type || 'free'}
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
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleUserDetails(record._id)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} lg={8}>
            <Search
              placeholder="Search by phone, name..."
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              allowClear
              onChange={handleStatusChange}
            >
              <Option value="true">Verified</Option>
              <Option value="false">Pending</Option>
            </Select>
          </Col>
        </Row>

        <Table
          dataSource={users}
          columns={columns}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
            onChange: (page, pageSize) => {
              setPagination({ current: page, pageSize, total: pagination.total });
            },
          }}
          rowKey="_id"
        />
      </Card>

      <Modal
        title="User Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedUser && (
          <div>
            <Descriptions title="Basic Information" bordered size="small">
              <Descriptions.Item label="Phone Number" span={2}>
                {selectedUser.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedUser.isVerified ? 'green' : 'orange'}>
                  {selectedUser.isVerified ? 'Verified' : 'Pending'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Full Name" span={2}>
                {selectedUser.profile?.firstName ? 
                  `${selectedUser.profile.firstName} ${selectedUser.profile.lastName || ''}`.trim() : 
                  'Not set'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {selectedUser.profile?.gender || 'Not set'}
              </Descriptions.Item>
              <Descriptions.Item label="Date of Birth" span={2}>
                {selectedUser.profile?.dateOfBirth ? 
                  moment(selectedUser.profile.dateOfBirth).format('MMM DD, YYYY') : 
                  'Not set'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Time of Birth">
                {selectedUser.profile?.timeOfBirth || 'Not set'}
              </Descriptions.Item>
              <Descriptions.Item label="Place of Birth" span={3}>
                {selectedUser.profile?.placeOfBirth || 'Not set'}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="Astrology Information" bordered size="small" style={{ marginTop: '24px' }}>
              <Descriptions.Item label="Sun Sign" span={2}>
                {selectedUser.birthChart?.sunSign ? 
                  <Tag color="purple">{selectedUser.birthChart.sunSign}</Tag> : 
                  'Not calculated'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Moon Sign">
                {selectedUser.birthChart?.moonSign || 'Not set'}
              </Descriptions.Item>
              <Descriptions.Item label="Ascendant" span={2}>
                {selectedUser.birthChart?.ascendant || 'Not set'}
              </Descriptions.Item>
              <Descriptions.Item label="Recalculation Needed">
                <Tag color={selectedUser.birthChart?.recalculationQueued ? 'orange' : 'green'}>
                  {selectedUser.birthChart?.recalculationQueued ? 'Yes' : 'No'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="Subscription & Activity" bordered size="small" style={{ marginTop: '24px' }}>
              <Descriptions.Item label="Subscription Type" span={2}>
                <Tag color={selectedUser.subscription?.type === 'premium' ? 'gold' : 
                           selectedUser.subscription?.type === 'pro' ? 'purple' : 'default'}>
                  {selectedUser.subscription?.type || 'free'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Auto Renew">
                <Tag color={selectedUser.subscription?.autoRenew ? 'green' : 'default'}>
                  {selectedUser.subscription?.autoRenew ? 'Yes' : 'No'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Joined" span={2}>
                {moment(selectedUser.createdAt).format('MMM DD, YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Last Active">
                {selectedUser.lastActive ? moment(selectedUser.lastActive).fromNow() : 'Never'}
              </Descriptions.Item>
            </Descriptions>

            {selectedUser.stats && (
              <Descriptions title="Usage Statistics" bordered size="small" style={{ marginTop: '24px' }}>
                <Descriptions.Item label="Horoscope Views" span={2}>
                  {selectedUser.stats.horoscope_views || 0}
                </Descriptions.Item>
                <Descriptions.Item label="Profile Updates">
                  {selectedUser.stats.profile_updates || 0}
                </Descriptions.Item>
                <Descriptions.Item label="Last Stats Update" span={3}>
                  {selectedUser.stats.updated_at ? 
                    moment(selectedUser.stats.updated_at).format('MMM DD, YYYY HH:mm') : 
                    'Never'
                  }
                </Descriptions.Item>
              </Descriptions>
            )}

            <Descriptions title="Preferences" bordered size="small" style={{ marginTop: '24px' }}>
              <Descriptions.Item label="Timezone" span={2}>
                {selectedUser.preferences?.timezone || 'Asia/Kolkata'}
              </Descriptions.Item>
              <Descriptions.Item label="Language">
                {selectedUser.preferences?.language || 'en'}
              </Descriptions.Item>
              <Descriptions.Item label="Daily Notifications" span={2}>
                <Tag color={selectedUser.preferences?.notifications?.daily ? 'green' : 'default'}>
                  {selectedUser.preferences?.notifications?.daily ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Weekly Notifications">
                <Tag color={selectedUser.preferences?.notifications?.weekly ? 'green' : 'default'}>
                  {selectedUser.preferences?.notifications?.weekly ? 'Enabled' : 'Disabled'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;