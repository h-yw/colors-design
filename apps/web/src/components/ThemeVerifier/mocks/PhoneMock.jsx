import React, { useState } from 'react';
import './mocks.css';

export const PhoneMock = () => {
  const [airplaneMode, setAirplaneMode] = useState(false);
  const [bluetooth, setBluetooth] = useState(true);

  return (
    <div className="phone-frame">
      <div className="phone-notch"></div>
      <div className="phone-screen">
        <div className="phone-status-bar">
          <span>9:41</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>

        <div className="phone-header">
          <div className="phone-header-title">设置</div>
          <div className="phone-avatar">JD</div>
        </div>

        <div className="phone-content">
          <div className="phone-group-title">通用</div>
          <div className="phone-list-group">
            <div className="phone-list-item" onClick={() => setAirplaneMode(!airplaneMode)}>
              <div className="phone-icon icon-orange">✈️</div>
              <div className="phone-label">飞行模式</div>
              <div className={`phone-toggle ${airplaneMode ? 'active' : ''}`}></div>
            </div>
            <div className="phone-list-item">
              <div className="phone-icon icon-blue">W</div>
              <div className="phone-label">无线局域网</div>
              <div className="phone-value">Home_5G</div>
            </div>
            <div className="phone-list-item" onClick={() => setBluetooth(!bluetooth)}>
              <div className="phone-icon icon-blue">B</div>
              <div className="phone-label">蓝牙</div>
              <div className="phone-value">{bluetooth ? '开启' : '关闭'}</div>
            </div>
          </div>

          <div className="phone-group-title">显示与亮度</div>
          <div className="phone-list-group">
            <div className="phone-list-item">
              <div className="phone-icon icon-purple">☀</div>
              <div className="phone-label">亮度调节</div>
            </div>
            <div className="phone-list-item">
              <div className="phone-icon icon-red">Aa</div>
              <div className="phone-label">字体大小</div>
            </div>
          </div>

          <div className="phone-group-title">隐私</div>
          <div className="phone-list-group">
            <div className="phone-list-item">
              <div className="phone-icon icon-gray">🔒</div>
              <div className="phone-label">隐私与安全性</div>
            </div>
            <div className="phone-list-item">
              <div className="phone-icon icon-gray">📍</div>
              <div className="phone-label">定位服务</div>
              <div className="phone-value">开启</div>
            </div>
          </div>
        </div>

        <div className="phone-fab">+</div>
      </div>
    </div>
  );
};
