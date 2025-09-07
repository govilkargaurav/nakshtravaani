import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Row,
  Col,
  Slider,
  Space,
  Popconfirm,
  Tag,
  Switch,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClearOutlined,
  CalendarOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { horoscopeAPI } from '../services/api';
import moment from 'moment';

const { TextArea } = Input;
const { Option } = Select;

const zodiacSigns = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const colors = [
  'Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet',
  'Pink', 'Purple', 'Brown', 'Black', 'White', 'Gold', 'Silver',
  'Deep Blue', 'Crimson', 'Navy Blue', 'Sea Green', 'Lavender'
];

const Horoscopes = () => {
  const [horoscopes, setHoroscopes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHoroscope, setEditingHoroscope] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 12, total: 0 });
  const [selectedDate, setSelectedDate] = useState(moment());
  const [selectedSign, setSelectedSign] = useState(null);
  const [publishLoading, setPublishLoading] = useState({});

  useEffect(() => {
    fetchHoroscopes();
  }, [pagination.current, pagination.pageSize, selectedDate, selectedSign]);

  const fetchHoroscopes = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
      };
      if (selectedDate) {
        params.date = selectedDate.format('YYYY-MM-DD');
      }
      if (selectedSign) {
        params.sunSign = selectedSign;
      }
      const response = await horoscopeAPI.getAll(params);
      const { horoscopes, pagination: paginationData } = response.data.data;
      
      setHoroscopes(horoscopes);
      setPagination(prev => ({
        ...prev,
        total: paginationData.total,
      }));
    } catch (error) {
      message.error('Failed to fetch horoscopes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEdit = () => {
    setEditingHoroscope(null);
    form.resetFields();
    form.setFieldsValue({
      date: moment(),
      moodRatings: { energy: 3, love: 3, work: 3, luck: 3 },
      published: false
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        sections: {
          career: { title: 'Career & Work', text: values.careerText },
          love: { title: 'Love & Relationships', text: values.loveText },
          finance: { title: 'Money & Finance', text: values.financeText },
          health: { title: 'Health & Wellness', text: values.healthText },
          personalGrowth: { title: 'Personal Growth', text: values.personalGrowthText }
        },
        dosAndDonts: {
          dos: values.dos ? values.dos.split('\n').filter(item => item.trim()) : [],
          donts: values.donts ? values.donts.split('\n').filter(item => item.trim()) : []
        },
        lucky: {
          numbers: values.luckyNumbers ? values.luckyNumbers.split(',').map(n => n.trim()) : [],
          colors: values.luckyColors || [],
          timeOfDay: values.timeOfDay
        },
        chartSnippet: {
          moonPosition: values.moonPosition,
          majorTransit: values.majorTransit ? values.majorTransit.split(',').map(t => t.trim()) : []
        },
        comparison: {
          yesterdayVsToday: values.yesterdayComparison,
          tomorrowPreview: values.tomorrowPreview
        }
      };

      await horoscopeAPI.create(formattedValues);
      message.success('Horoscope saved successfully');
      setModalVisible(false);
      fetchHoroscopes();
    } catch (error) {
      message.error(error.response?.data?.error?.message || 'Failed to save horoscope');
    }
  };

  const handleDelete = async (id) => {
    try {
      await horoscopeAPI.delete(id);
      message.success('Horoscope deleted successfully');
      fetchHoroscopes();
    } catch (error) {
      message.error('Failed to delete horoscope');
    }
  };

  const handleClearCache = async () => {
    try {
      await horoscopeAPI.clearCache({});
      message.success('Cache cleared successfully');
    } catch (error) {
      message.error('Failed to clear cache');
    }
  };

  const handlePublishToggle = async (id, currentStatus) => {
    setPublishLoading(prev => ({ ...prev, [id]: true }));
    try {
      await horoscopeAPI.publish(id, { published: !currentStatus });
      message.success(`Horoscope ${!currentStatus ? 'published' : 'unpublished'} successfully`);
      fetchHoroscopes();
    } catch (error) {
      message.error('Failed to update horoscope status');
    } finally {
      setPublishLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleFilterReset = () => {
    setSelectedDate(moment());
    setSelectedSign(null);
    setPagination({ current: 1, pageSize: 12, total: 0 });
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Sign',
      dataIndex: 'sun_sign',
      key: 'sun_sign',
      render: (sign) => <Tag color="purple">{sign}</Tag>,
    },
    {
      title: 'Summary',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
    },
    {
      title: 'Theme',
      dataIndex: 'theme',
      key: 'theme',
    },
    {
      title: 'Status',
      dataIndex: 'published',
      key: 'published',
      render: (published, record) => (
        <Switch
          checked={published}
          loading={publishLoading[record.id]}
          onChange={() => handlePublishToggle(record.id, published)}
          checkedChildren="Published"
          unCheckedChildren="Draft"
        />
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => moment(date).format('MMM DD, HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = (record) => {
    setEditingHoroscope(record);
    const sections = typeof record.sections === 'string' ? JSON.parse(record.sections) : record.sections;
    const dosAndDonts = typeof record.dos_and_donts === 'string' ? JSON.parse(record.dos_and_donts) : record.dos_and_donts;
    const lucky = typeof record.lucky === 'string' ? JSON.parse(record.lucky) : record.lucky;
    const chartSnippet = typeof record.chart_snippet === 'string' ? JSON.parse(record.chart_snippet) : record.chart_snippet;
    const comparison = typeof record.comparison === 'string' ? JSON.parse(record.comparison) : record.comparison;
    const moodRatings = typeof record.mood_ratings === 'string' ? JSON.parse(record.mood_ratings) : record.mood_ratings;

    form.setFieldsValue({
      date: moment(record.date),
      sunSign: record.sun_sign,
      summary: record.summary,
      theme: record.theme,
      notificationText: record.notification_text,
      careerText: sections?.career?.text,
      loveText: sections?.love?.text,
      financeText: sections?.finance?.text,
      healthText: sections?.health?.text,
      personalGrowthText: sections?.personalGrowth?.text,
      dos: dosAndDonts?.dos?.join('\n'),
      donts: dosAndDonts?.donts?.join('\n'),
      luckyNumbers: lucky?.numbers?.join(', '),
      luckyColors: lucky?.colors,
      timeOfDay: lucky?.timeOfDay,
      affirmation: record.affirmation,
      moonPosition: chartSnippet?.moonPosition,
      majorTransit: chartSnippet?.majorTransit?.join(', '),
      yesterdayComparison: comparison?.yesterdayVsToday,
      tomorrowPreview: comparison?.tomorrowPreview,
      explanation: record.explanation,
      moodRatings,
      published: record.published
    });
    setModalVisible(true);
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateEdit}
            >
              Create New Horoscope
            </Button>
            <Button
              icon={<ClearOutlined />}
              onClick={handleClearCache}
            >
              Clear Cache
            </Button>
          </div>
          
          <Divider />
          
          <div style={{ marginBottom: '16px' }}>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={6}>
                <DatePicker
                  placeholder="Filter by date"
                  style={{ width: '100%' }}
                  value={selectedDate}
                  onChange={setSelectedDate}
                  allowClear
                  suffixIcon={<CalendarOutlined />}
                />
              </Col>
              <Col span={6}>
                <Select
                  placeholder="Filter by zodiac sign"
                  style={{ width: '100%' }}
                  value={selectedSign}
                  onChange={setSelectedSign}
                  allowClear
                  suffixIcon={<FilterOutlined />}
                >
                  {zodiacSigns.map(sign => (
                    <Option key={sign} value={sign}>{sign}</Option>
                  ))}
                </Select>
              </Col>
              <Col span={6}>
                <Button onClick={handleFilterReset} style={{ width: '100%' }}>
                  Reset Filters
                </Button>
              </Col>
              <Col span={6}>
                <div style={{ textAlign: 'right', color: '#666', fontSize: '14px', padding: '6px 0' }}>
                  Total: {pagination.total} horoscopes
                </div>
              </Col>
            </Row>
            
            <Row gutter={8}>
              <Col>
                <span style={{ marginRight: '8px', color: '#666' }}>Quick Date Navigation:</span>
              </Col>
              <Col>
                <Button 
                  size="small" 
                  onClick={() => setSelectedDate(moment().subtract(1, 'day'))}
                  type={selectedDate && selectedDate.isSame(moment().subtract(1, 'day'), 'day') ? 'primary' : 'default'}
                >
                  Yesterday
                </Button>
              </Col>
              <Col>
                <Button 
                  size="small" 
                  onClick={() => setSelectedDate(moment())}
                  type={selectedDate && selectedDate.isSame(moment(), 'day') ? 'primary' : 'default'}
                >
                  Today
                </Button>
              </Col>
              <Col>
                <Button 
                  size="small" 
                  onClick={() => setSelectedDate(moment().add(1, 'day'))}
                  type={selectedDate && selectedDate.isSame(moment().add(1, 'day'), 'day') ? 'primary' : 'default'}
                >
                  Tomorrow
                </Button>
              </Col>
            </Row>
          </div>
        </div>

        <Table
          dataSource={horoscopes}
          columns={columns}
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => {
              setPagination({ current: page, pageSize, total: pagination.total });
            },
          }}
          rowKey="id"
        />
      </Card>

      <Modal
        title={editingHoroscope ? 'Edit Horoscope' : 'Create New Horoscope'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          className="horoscope-form"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sunSign"
                label="Zodiac Sign"
                rules={[{ required: true, message: 'Please select zodiac sign' }]}
              >
                <Select placeholder="Select zodiac sign">
                  {zodiacSigns.map(sign => (
                    <Option key={sign} value={sign}>{sign}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="summary"
            label="Summary (max 140 chars)"
            rules={[{ required: true, message: 'Please enter summary' }]}
          >
            <TextArea rows={2} maxLength={140} showCount />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="theme" label="Theme (max 50 chars)">
                <Input maxLength={50} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="notificationText" label="Notification Text (max 80 chars)">
                <Input maxLength={80} />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ marginBottom: '24px' }}>
            <h3>Sections</h3>
            <Form.Item name="careerText" label="Career & Work" rules={[{ required: true }]}>
              <TextArea rows={3} maxLength={200} showCount />
            </Form.Item>
            <Form.Item name="loveText" label="Love & Relationships" rules={[{ required: true }]}>
              <TextArea rows={3} maxLength={200} showCount />
            </Form.Item>
            <Form.Item name="financeText" label="Money & Finance" rules={[{ required: true }]}>
              <TextArea rows={3} maxLength={200} showCount />
            </Form.Item>
            <Form.Item name="healthText" label="Health & Wellness" rules={[{ required: true }]}>
              <TextArea rows={3} maxLength={200} showCount />
            </Form.Item>
            <Form.Item name="personalGrowthText" label="Personal Growth" rules={[{ required: true }]}>
              <TextArea rows={3} maxLength={200} showCount />
            </Form.Item>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3>Dos and Don'ts</h3>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="dos" label="Dos (one per line, max 3)">
                  <TextArea rows={4} placeholder="Enter dos, one per line" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="donts" label="Don'ts (one per line, max 2)">
                  <TextArea rows={4} placeholder="Enter don'ts, one per line" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3>Lucky Elements</h3>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="luckyNumbers" label="Lucky Numbers (comma-separated)">
                  <Input placeholder="3, 7, 21" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="luckyColors" label="Lucky Colors">
                  <Select mode="multiple" placeholder="Select colors">
                    {colors.map(color => (
                      <Option key={color} value={color}>{color}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="timeOfDay" label="Lucky Time">
                  <Input placeholder="10:00-12:00 local" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3>Mood Ratings (0-5)</h3>
            <div className="mood-ratings">
              <Form.Item name={['moodRatings', 'energy']} label="Energy">
                <Slider min={0} max={5} marks={{ 0: '0', 5: '5' }} />
              </Form.Item>
              <Form.Item name={['moodRatings', 'love']} label="Love">
                <Slider min={0} max={5} marks={{ 0: '0', 5: '5' }} />
              </Form.Item>
              <Form.Item name={['moodRatings', 'work']} label="Work">
                <Slider min={0} max={5} marks={{ 0: '0', 5: '5' }} />
              </Form.Item>
              <Form.Item name={['moodRatings', 'luck']} label="Luck">
                <Slider min={0} max={5} marks={{ 0: '0', 5: '5' }} />
              </Form.Item>
            </div>
          </div>

          <Form.Item name="affirmation" label="Affirmation (max 90 chars)">
            <TextArea rows={2} maxLength={90} showCount />
          </Form.Item>

          <div style={{ marginBottom: '24px' }}>
            <h3>Chart Details</h3>
            <Form.Item name="moonPosition" label="Moon Position">
              <Input placeholder="Moon in Libra — emphasis on balance" />
            </Form.Item>
            <Form.Item name="majorTransit" label="Major Transits (comma-separated)">
              <Input placeholder="Mercury trine Venus, Moon conjunct Mars" />
            </Form.Item>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h3>Comparisons</h3>
            <Form.Item name="yesterdayComparison" label="Yesterday vs Today">
              <TextArea rows={2} placeholder="Calmer than yesterday..." />
            </Form.Item>
            <Form.Item name="tomorrowPreview" label="Tomorrow Preview">
              <TextArea rows={2} placeholder="Tomorrow may bring..." />
            </Form.Item>
          </div>

          <Form.Item name="explanation" label="Explanation (max 300 chars)">
            <TextArea rows={3} maxLength={300} showCount />
          </Form.Item>

          <Form.Item name="published" label="Publish Status" valuePropName="checked">
            <Switch
              checkedChildren="Published"
              unCheckedChildren="Draft"
              defaultChecked={false}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingHoroscope ? 'Update' : 'Create'} Horoscope
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Horoscopes;