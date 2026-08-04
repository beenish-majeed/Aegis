import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from '../modal';

describe('Modal Component', () => {
  it('renders modal when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Diagnostic Dialog">
        <p>Modal content body</p>
      </Modal>
    );

    expect(screen.getByText('Diagnostic Dialog')).toBeInTheDocument();
    expect(screen.getByText('Modal content body')).toBeInTheDocument();
  });

  it('triggers onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Diagnostic Dialog">
        <p>Modal content</p>
      </Modal>
    );

    fireEvent.click(screen.getByRole('button', { name: /close dialog/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
