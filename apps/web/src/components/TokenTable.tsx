
import React from 'react';

interface TokenTableProps {
    tokens: { [key: string]: string };
}

export const TokenTable: React.FC<TokenTableProps> = ({ tokens }) => {
  return (
    <section className="docs-section">
      <h2>Token Dictionary</h2>
      <div style={{ overflowX: 'auto' }}>
        <table className="token-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Preview</th>
              <th>Token Name</th>
              <th>Computed Value</th>
              <th>Usage Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {tokens && Object.entries(tokens).map(([key, value]) => (
              <tr key={key}>
                <td>
                  <div className="token-preview" style={{ backgroundColor: value }} />
                </td>
                <td className="token-name">--sys-{key.replace(/\./g, '-')}</td>
                <td className="token-value">{value}</td>
                <td className="text-xs">
                  {key.includes('bg') ? 'Background & Surfaces' :
                    key.includes('text') ? 'Typography & Content' :
                      key.includes('border') ? 'Dividers & Outlines' :
                        key.includes('brand') ? 'Brand Identity' :
                          key.includes('action') ? 'Interaction States' :
                            key.includes('effect') ? 'Elevation & Effects' : 'Status Indicators'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
