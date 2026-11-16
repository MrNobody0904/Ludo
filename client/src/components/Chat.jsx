import React, { useState, useRef, useEffect } from 'react';
import Card from './Card';
import Input from './Input';
import Button from './Button';

export default function Chat({ messages = [], onSendMessage }) {
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', height: '240px', padding: '12px' }}>
      <div className="label-sm" style={{ marginBottom: '8px', opacity: 0.8 }}>
        Room Chat
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          paddingRight: '4px'
        }}
      >
        {messages.length === 0 ? (
          <div className="body-sm" style={{ opacity: 0.5, fontStyle: 'italic', margin: 'auto' }}>
            No messages yet. Say hi!
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={m.id || i} className="body-sm" style={{ lineHeight: 1.3 }}>
              <span style={{ fontWeight: 700, color: 'var(--color-tertiary)' }}>
                {m.senderName}:{' '}
              </span>
              <span>{m.text}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          maxLength={100}
          style={{ flex: 1 }}
        />
        <Button variant="primary" type="submit" style={{ minWidth: '70px', height: '42px' }}>
          Send
        </Button>
      </form>
    </Card>
  );
}
