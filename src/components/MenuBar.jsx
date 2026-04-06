import React, { useState, useRef, useEffect } from 'react';

const MENU_STYLE = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: 0,
  background: '#191c22',
  border: '1px solid #2D3139',
  borderRadius: '10px',
  boxShadow: '0 20px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.03)',
  minWidth: '210px',
  zIndex: 9999,
  overflow: 'hidden',
  padding: '5px',
};

const SEPARATOR_STYLE = {
  height: '1px',
  background: 'rgba(133,147,153,0.1)',
  margin: '4px 0',
};

function MenuItem({ label, shortcut, danger, onClick, disabled }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '7px 12px',
        background: hovered && !disabled ? '#2D3139' : 'transparent',
        border: 'none',
        color: disabled
          ? '#3d4a52'
          : danger
          ? '#ffb4ab'
          : hovered
          ? '#e1e2eb'
          : '#b5c0c5',
        fontSize: '12.5px',
        cursor: disabled ? 'default' : 'pointer',
        borderRadius: '6px',
        textAlign: 'left',
        fontFamily: 'inherit',
        gap: '16px',
        transition: 'background 0.1s, color 0.1s',
      }}
    >
      <span>{label}</span>
      {shortcut && (
        <span
          style={{
            color: hovered ? '#6a7a85' : '#3d4a52',
            fontSize: '11px',
            letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
          }}
        >
          {shortcut}
        </span>
      )}
    </button>
  );
}

const MenuBar = ({
  onSaveProject,
  onDownloadScript,
  onUndo,
  onRedo,
  onToggleTerminal,
  isTerminalOpen,
  onClearLogs,
  onRestartEngine,
  isInitializing,
  className = "",
}) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const menuBarRef = useRef(null);

  // Click-outside to close all dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };
    if (activeMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [activeMenu]);

  const toggle = (name) => setActiveMenu((prev) => (prev === name ? null : name));

  const exec = (action) => {
    setActiveMenu(null);
    if (action) action();
  };

  const menus = [
    {
      name: 'File',
      items: [
        {
          label: 'Save Workspace Project',
          shortcut: 'Ctrl+Shift+S',
          action: onSaveProject,
        },
        {
          label: 'Download Script (.py)',
          shortcut: 'Ctrl+S',
          action: onDownloadScript,
        },
      ],
    },
    {
      name: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: onUndo },
        { label: 'Redo', shortcut: 'Ctrl+Y', action: onRedo },
      ],
    },
    {
      name: 'View',
      items: [
        {
          label: isTerminalOpen ? 'Hide Terminal' : 'Show Terminal',
          shortcut: 'Ctrl+`',
          action: onToggleTerminal,
        },
      ],
    },
    {
      name: 'Terminal',
      items: [
        { label: 'Clear Logs', action: onClearLogs },
        null, // separator
        {
          label: 'Restart Engine',
          shortcut: 'Hard Reset',
          action: onRestartEngine,
          danger: true,
          disabled: isInitializing,
        },
      ],
    },
  ];

  return (
    <nav 
      className={className} 
      ref={menuBarRef} 
      style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '4px' }}
    >
      {menus.map((menu) => {
        const isOpen = activeMenu === menu.name;

        return (
          <div key={menu.name} style={{ position: 'relative' }}>
            {/* Menu trigger button */}
            <button
              onClick={() => toggle(menu.name)}
              style={{
                background: isOpen ? 'rgba(133,147,153,0.12)' : 'transparent',
                color: isOpen ? '#e1e2eb' : '#7a8a92',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: 500,
                fontFamily: 'inherit',
                letterSpacing: '0.01em',
                lineHeight: 1,
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isOpen) e.currentTarget.style.color = '#c0ccd2';
              }}
              onMouseLeave={(e) => {
                if (!isOpen) e.currentTarget.style.color = '#7a8a92';
              }}
            >
              {menu.name}
            </button>

            {/* Dropdown panel */}
            {isOpen && (
              <div style={MENU_STYLE}>
                {menu.items.map((item, idx) =>
                  item === null ? (
                    <div key={`sep-${idx}`} style={SEPARATOR_STYLE} />
                  ) : (
                    <MenuItem
                      key={item.label}
                      label={item.label}
                      shortcut={item.shortcut}
                      danger={item.danger}
                      disabled={item.disabled}
                      onClick={() => exec(item.action)}
                    />
                  )
                )}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default MenuBar;
