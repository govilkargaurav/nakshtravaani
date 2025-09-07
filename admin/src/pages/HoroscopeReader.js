import React, { useState, useEffect } from 'react';
import {
  Card,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  Typography,
  Divider,
  Tag,
  Space,
  Switch,
  message,
  Spin,
  Empty
} from 'antd';
import {
  CalendarOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { horoscopeAPI } from '../services/api';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const zodiacSigns = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const HoroscopeReader = () => {
  const [selectedSign, setSelectedSign] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [horoscope, setHoroscope] = useState(null);
  const [loading, setLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  useEffect(() => {
    if (selectedSign && selectedDate) {
      fetchHoroscope();
    }
  }, [selectedSign, selectedDate]);

  const fetchHoroscope = async () => {
    setLoading(true);
    try {
      const params = {
        date: selectedDate.format('YYYY-MM-DD'),
        sunSign: selectedSign
      };
      const response = await horoscopeAPI.getAll(params);
      const horoscopes = response.data.data.horoscopes;
      setHoroscope(horoscopes.length > 0 ? horoscopes[0] : null);
    } catch (error) {
      message.error('Failed to fetch horoscope');
      setHoroscope(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!horoscope) return;
    
    setPublishLoading(true);
    try {
      await horoscopeAPI.publish(horoscope.id, { published: !horoscope.published });
      message.success(`Horoscope ${!horoscope.published ? 'published' : 'unpublished'} successfully`);
      setHoroscope(prev => ({ ...prev, published: !prev.published }));
    } catch (error) {
      message.error('Failed to update horoscope status');
    } finally {
      setPublishLoading(false);
    }
  };

  const parseJSONField = (field) => {
    if (!field) return {};
    return typeof field === 'string' ? JSON.parse(field) : field;
  };

  const sections = parseJSONField(horoscope?.sections);
  const dosAndDonts = parseJSONField(horoscope?.dos_and_donts);
  const lucky = parseJSONField(horoscope?.lucky);
  const moodRatings = parseJSONField(horoscope?.mood_ratings);
  const chartSnippet = parseJSONField(horoscope?.chart_snippet);
  const comparison = parseJSONField(horoscope?.comparison);

  return (
    <div>
      <Card>
        <div style={{ marginBottom: '24px' }}>
          <Title level={3}>📖 Horoscope Reader</Title>
          <Text type="secondary">Read and manage horoscopes by zodiac sign and date</Text>
        </div>

        {/* Controls */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Select
              placeholder="Select zodiac sign"
              style={{ width: '100%' }}
              value={selectedSign}
              onChange={setSelectedSign}
              size="large"
            >
              {zodiacSigns.map(sign => (
                <Option key={sign} value={sign}>
                  {sign} ♈
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <DatePicker
              placeholder="Select date"
              style={{ width: '100%' }}
              value={selectedDate}
              onChange={setSelectedDate}
              size="large"
              suffixIcon={<CalendarOutlined />}
            />
          </Col>
          <Col span={12}>
            <Row gutter={8}>
              <Col>
                <span style={{ marginRight: '8px', color: '#666' }}>Quick Navigation:</span>
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
          </Col>
        </Row>

        {/* Horoscope Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px' }}>Loading horoscope...</p>
          </div>
        ) : !selectedSign ? (
          <Empty 
            description="Please select a zodiac sign to view horoscope"
            style={{ padding: '60px 0' }}
          />
        ) : !horoscope ? (
          <Empty 
            description={`No horoscope found for ${selectedSign} on ${selectedDate.format('MMM DD, YYYY')}`}
            style={{ padding: '60px 0' }}
          />
        ) : (
          <div>
            {/* Header */}
            <Card style={{ marginBottom: '24px', background: '#f5f5f5' }}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Space size="large">
                    <div>
                      <Title level={2} style={{ margin: 0, color: '#722ed1' }}>
                        {selectedSign}
                      </Title>
                      <Text type="secondary">{selectedDate.format('MMMM DD, YYYY')}</Text>
                    </div>
                    <div>
                      <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                        {horoscope.theme}
                      </Tag>
                    </div>
                  </Space>
                </Col>
                <Col>
                  <Space>
                    <Switch
                      checked={horoscope.published}
                      loading={publishLoading}
                      onChange={handlePublishToggle}
                      checkedChildren="Published"
                      unCheckedChildren="Draft"
                      size="default"
                    />
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => message.info('Edit functionality can be added here')}
                    >
                      Edit
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Summary */}
            <Card title="📋 Daily Summary" style={{ marginBottom: '24px' }}>
              <Paragraph style={{ fontSize: '16px', lineHeight: 1.6 }}>
                {horoscope.summary}
              </Paragraph>
              {horoscope.notification_text && (
                <div style={{ background: '#f0f0f0', padding: '12px', borderRadius: '6px', marginTop: '16px' }}>
                  <Text strong>🔔 Notification: </Text>
                  <Text>{horoscope.notification_text}</Text>
                </div>
              )}
            </Card>

            {/* Sections */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
              {Object.entries(sections).map(([key, section]) => (
                <Col span={12} key={key} style={{ marginBottom: '16px' }}>
                  <Card title={section.title} size="small">
                    <Text>{section.text}</Text>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Mood Ratings */}
            {moodRatings && (
              <Card title="🎭 Mood Ratings" style={{ marginBottom: '24px' }}>
                <Row gutter={16}>
                  {Object.entries(moodRatings).map(([key, rating]) => (
                    <Col span={6} key={key}>
                      <div style={{ textAlign: 'center' }}>
                        <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                          {rating}/5
                        </Title>
                        <Text style={{ textTransform: 'capitalize' }}>{key}</Text>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card>
            )}

            {/* Lucky Elements & Dos/Don'ts */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col span={12}>
                <Card title="🍀 Lucky Elements">
                  {lucky.numbers && (
                    <div style={{ marginBottom: '12px' }}>
                      <Text strong>Numbers: </Text>
                      {lucky.numbers.map(num => (
                        <Tag key={num} color="green">{num}</Tag>
                      ))}
                    </div>
                  )}
                  {lucky.colors && (
                    <div style={{ marginBottom: '12px' }}>
                      <Text strong>Colors: </Text>
                      {lucky.colors.map(color => (
                        <Tag key={color} color="blue">{color}</Tag>
                      ))}
                    </div>
                  )}
                  {lucky.timeOfDay && (
                    <div>
                      <Text strong>Best Time: </Text>
                      <Text>{lucky.timeOfDay}</Text>
                    </div>
                  )}
                </Card>
              </Col>
              <Col span={12}>
                <Card title="✅ Dos & Don'ts">
                  {dosAndDonts.dos && (
                    <div style={{ marginBottom: '16px' }}>
                      <Text strong style={{ color: 'green' }}>✅ Dos:</Text>
                      <ul style={{ marginTop: '8px' }}>
                        {dosAndDonts.dos.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {dosAndDonts.donts && (
                    <div>
                      <Text strong style={{ color: 'red' }}>❌ Don'ts:</Text>
                      <ul style={{ marginTop: '8px' }}>
                        {dosAndDonts.donts.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>

            {/* Affirmation */}
            {horoscope.affirmation && (
              <Card title="💫 Daily Affirmation" style={{ marginBottom: '24px' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <Text style={{ 
                    fontSize: '18px', 
                    fontStyle: 'italic',
                    color: 'white'
                  }}>
                    "{horoscope.affirmation}"
                  </Text>
                </div>
              </Card>
            )}

            {/* Chart Details & Comparisons */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col span={12}>
                <Card title="🌙 Astrological Details">
                  {chartSnippet.moonPosition && (
                    <div style={{ marginBottom: '12px' }}>
                      <Text strong>Moon Position: </Text>
                      <br />
                      <Text>{chartSnippet.moonPosition}</Text>
                    </div>
                  )}
                  {chartSnippet.majorTransit && chartSnippet.majorTransit.length > 0 && (
                    <div>
                      <Text strong>Major Transits: </Text>
                      <br />
                      {chartSnippet.majorTransit.map(transit => (
                        <Tag key={transit} color="purple" style={{ margin: '4px' }}>
                          {transit}
                        </Tag>
                      ))}
                    </div>
                  )}
                </Card>
              </Col>
              <Col span={12}>
                <Card title="📊 Comparisons">
                  {comparison.yesterdayVsToday && (
                    <div style={{ marginBottom: '12px' }}>
                      <Text strong>Yesterday vs Today: </Text>
                      <br />
                      <Text>{comparison.yesterdayVsToday}</Text>
                    </div>
                  )}
                  {comparison.tomorrowPreview && (
                    <div>
                      <Text strong>Tomorrow Preview: </Text>
                      <br />
                      <Text>{comparison.tomorrowPreview}</Text>
                    </div>
                  )}
                </Card>
              </Col>
            </Row>

            {/* Explanation */}
            {horoscope.explanation && (
              <Card title="🔮 Astrological Explanation" style={{ marginBottom: '24px' }}>
                <Paragraph style={{ fontSize: '15px', lineHeight: 1.6 }}>
                  {horoscope.explanation}
                </Paragraph>
              </Card>
            )}

            {/* Metadata */}
            <Card title="ℹ️ Metadata" size="small">
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>Created: </Text>
                  <Text>{moment(horoscope.created_at).format('MMM DD, YYYY HH:mm')}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Updated: </Text>
                  <Text>{moment(horoscope.updated_at).format('MMM DD, YYYY HH:mm')}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Status: </Text>
                  <Tag color={horoscope.published ? 'green' : 'orange'}>
                    {horoscope.published ? 'Published' : 'Draft'}
                  </Tag>
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
};

export default HoroscopeReader;