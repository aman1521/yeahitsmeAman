import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FiMoreVertical, FiEdit, FiTrash2, FiPower, FiEye } from 'react-icons/fi';

const ActionsDropdown = ({ 
  onView,
  onEdit, 
  onDelete, 
  onToggleStatus, 
  isActive,
  viewLabel = 'View',
  editLabel = 'Edit',
  deleteLabel = 'Delete',
  statusLabel = null,
  itemName = 'item'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const backdropRef = useRef(null);
  const allowCloseRef = useRef(false);

  const positionMenu = () => {
    if (!menuRef.current || !buttonRef.current || !isOpen) return;
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current.offsetHeight || 200; // Approximate menu height
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    
    // Calculate menu width (use actual width or estimate)
    const menuWidth = menuRef.current.offsetWidth || 180;
    
    // Position horizontally - align to right edge of button, but adjust if near viewport edge
    let leftPos = buttonRect.right - menuWidth;
    if (leftPos < 10) {
      leftPos = buttonRect.left;
    }
    // Ensure menu doesn't go beyond right edge
    if (leftPos + menuWidth > viewportWidth - 10) {
      leftPos = viewportWidth - menuWidth - 10;
    }
    
    // Position vertically
    let topPos;
    if (spaceBelow >= menuHeight + 10) {
      // Enough space below - open downward
      topPos = buttonRect.bottom + 4;
    } else if (spaceAbove >= menuHeight + 10) {
      // Not enough space below, but enough above - open upward
      topPos = buttonRect.top - menuHeight - 4;
    } else {
      // Not enough space in either direction - position within viewport
      topPos = Math.max(10, buttonRect.bottom + 4);
      if (topPos + menuHeight > viewportHeight - 10) {
        topPos = viewportHeight - menuHeight - 10;
      }
    }
    
    // Apply positioning
    menuRef.current.style.top = `${topPos}px`;
    menuRef.current.style.left = `${leftPos}px`;
    menuRef.current.style.visibility = 'visible';
    menuRef.current.style.opacity = '1';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on the button that opened the menu
      if (buttonRef.current && buttonRef.current.contains(event.target)) {
        return;
      }
      // Don't close if clicking inside the menu
      if (menuRef.current && menuRef.current.contains(event.target)) {
        return;
      }
      // Only close if enough time has passed
      if (allowCloseRef.current) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Allow closing after a short delay to prevent immediate closure
      const timer = setTimeout(() => {
        allowCloseRef.current = true;
      }, 100);

      // Position menu to prevent overflow - use setTimeout to ensure DOM is ready
      setTimeout(() => {
        positionMenu();
      }, 0);

      // Also position on window resize and scroll
      window.addEventListener('resize', positionMenu);
      window.addEventListener('scroll', positionMenu, true);
      
      // Close on escape key
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };
      
      // Delay adding click listener to prevent immediate closure
      const clickTimer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside, true);
      }, 150);

      document.addEventListener('keydown', handleEscape);

      return () => {
        clearTimeout(timer);
        clearTimeout(clickTimer);
        document.removeEventListener('click', handleClickOutside, true);
        document.removeEventListener('keydown', handleEscape);
        window.removeEventListener('resize', positionMenu);
        window.removeEventListener('scroll', positionMenu, true);
      };
    } else {
      allowCloseRef.current = false;
    }
  }, [isOpen]);

  const handleEdit = () => {
    if (onEdit) onEdit();
    setIsOpen(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this ${itemName}?`)) {
      if (onDelete) onDelete();
    }
    setIsOpen(false);
  };

  const handleToggleStatus = () => {
    if (onToggleStatus) onToggleStatus();
    setIsOpen(false);
  };

  const handleView = () => {
    if (onView) onView();
    setIsOpen(false);
  };

  // Render menu using portal to escape table constraints
  const menuContent = isOpen ? (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={(e) => {
          if (allowCloseRef.current && e.target === backdropRef.current) {
            setIsOpen(false);
          }
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          background: 'transparent'
        }}
      />
      {/* Menu */}
      <div
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          backgroundColor: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          zIndex: 10000,
          minWidth: '180px',
          padding: '4px 0',
          maxHeight: '300px',
          overflowY: 'auto',
          visibility: 'hidden',
          opacity: '0',
          display: 'block',
          pointerEvents: 'auto',
          top: '0px',
          left: '0px'
        }}
      >
          {onView && (
            <button
              onClick={handleView}
              style={{
                width: '100%',
                padding: '10px 16px',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#475569',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <FiEye size={16} />
              <span>{viewLabel}</span>
            </button>
          )}

          {onEdit && (
            <button
              onClick={handleEdit}
              style={{
                width: '100%',
                padding: '10px 16px',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#475569',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <FiEdit size={16} />
              <span>{editLabel}</span>
            </button>
          )}

          {onToggleStatus && (
            <button
              onClick={handleToggleStatus}
              style={{
                width: '100%',
                padding: '10px 16px',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: isActive ? '#f59e0b' : '#10b981',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <FiPower size={16} />
              <span>{statusLabel || (isActive ? 'Deactivate' : 'Activate')}</span>
            </button>
          )}

          {onDelete && (
            <>
              <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' }} />
              <button
                onClick={handleDelete}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#ef4444',
                  fontSize: '14px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <FiTrash2 size={16} />
                <span>{deleteLabel}</span>
              </button>
            </>
          )}
        </div>
      </>
    ) : null;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          borderRadius: '4px',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        title="Actions"
      >
        <FiMoreVertical size={18} />
      </button>

      {/* Use portal if available, otherwise render normally */}
      {isOpen && (typeof document !== 'undefined' && document.body
        ? ReactDOM.createPortal(menuContent, document.body)
        : menuContent)}
    </div>
  );
};

export default ActionsDropdown;

