import React, { useState } from 'react';
import './mocks.css';

export const DashboardMock = () => {
  const [period, setPeriod] = useState('周视图');
  const [activeStat, setActiveStat] = useState(0);

  const stats = [
    { label: '总收入', value: '¥242,593', trend: '+12%', type: 'positive' },
    { label: '活跃用户', value: '1,200', trend: '-3%', type: 'negative' },
    { label: '跳出率', value: '42%', trend: '0%', type: 'neutral' }
  ];

  const transactions = [
    { id: '#TR-34', user: '张三', amount: '¥120.00', status: '成功', date: '10月24' },
    { id: '#TR-35', user: '李四', amount: '¥54.50', status: '处理中', date: '10月24' },
    { id: '#TR-36', user: '王五', amount: '¥890.00', status: '失败', date: '10月23' },
    { id: '#TR-37', user: '赵六', amount: '¥35.00', status: '成功', date: '10月22' },
    { id: '#TR-38', user: '钱七', amount: '¥128.00', status: '成功', date: '10月22' },
    { id: '#TR-39', user: '孙八', amount: '¥66.00', status: '处理中', date: '10月21' },
  ];

  return (
    <div className="dash-frame">
      {/* Sidebar */}
      <div className="dash-sidebar">
        <div className="dash-logo"></div>
        <div className="dash-nav-group">
          <div className="dash-nav-item active">
            <span className="dash-icon home"></span> 首页
          </div>
          <div className="dash-nav-item">
            <span className="dash-icon chart"></span> 数据分析
          </div>
          <div className="dash-nav-item">
            <span className="dash-icon users"></span> 团队管理
          </div>
          <div className="dash-nav-item">
            <span className="dash-icon settings"></span> 设置
          </div>
        </div>
        <div className="dash-profile-section">
          <div className="dash-user-avatar"></div>
          <div className="dash-user-info">
            <div className="dash-user-name">管理员</div>
            <div className="dash-user-role">专业版</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dash-main">
        {/* Header */}
        <div className="dash-header">
          <div className="dash-search-bar">
            <span className="search-icon">🔍</span>
            <span>搜索...</span>
          </div>
          <div className="dash-header-actions">
            <div className="dash-icon-btn">🔔</div>
            <div className="dash-btn dash-btn-primary">+ 新建项目</div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="dash-stats-row">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`dash-card stat-card ${activeStat === idx ? 'active' : ''}`}
              onClick={() => setActiveStat(idx)}
            >
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
              <div className={`stat-trend ${stat.type}`}>{stat.trend} 较上周</div>
            </div>
          ))}
        </div>

        {/* Chart + Table Row */}
        <div className="dash-content-row">
          <div className="dash-card chart-card">
            <div className="chart-header">
              <span>收入趋势</span>
              <div className="chart-actions">
                <span
                  className={`pill ${period === '日视图' ? 'active' : ''}`}
                  onClick={() => setPeriod('日视图')}
                >日视图</span>
                <span
                  className={`pill ${period === '周视图' ? 'active' : ''}`}
                  onClick={() => setPeriod('周视图')}
                >周视图</span>
              </div>
            </div>
            <div className="chart-body">
              {/* Visual Columns */}
              <div className="chart-bar" style={{ height: period === '周视图' ? '40%' : '60%' }}></div>
              <div className="chart-bar" style={{ height: period === '周视图' ? '70%' : '30%' }}></div>
              <div className="chart-bar" style={{ height: period === '周视图' ? '50%' : '80%' }}></div>
              <div className="chart-bar" style={{ height: period === '周视图' ? '90%' : '45%' }}></div>
              <div className="chart-bar" style={{ height: period === '周视图' ? '60%' : '55%' }}></div>
            </div>
          </div>

          <div className="dash-card table-card">
            <div className="card-header">
              <span>最近交易</span>
              <div className="dash-btn dash-btn-sm">查看全部</div>
            </div>
            <div className="table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>用户</th>
                    <th>状态</th>
                    <th style={{ textAlign: 'right' }}>金额</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td>{t.user}</td>
                      <td><span className={`status-badge ${t.status === '成功' ? 'success' : t.status === '处理中' ? 'pending' : 'failed'}`}>{t.status}</span></td>
                      <td style={{ textAlign: 'right' }}>{t.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
