import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './button';

describe('Button', () => {
  it('renders with children text', () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole('button', { name: 'Click me' }),
    ).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>,
    );

    // The button should be disabled
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    // Click event should not fire due to disabled state
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies default variant styles', () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
  });

  it('applies destructive variant styles', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive');
  });

  it('applies outline variant styles', () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-input');
  });

  it('applies secondary variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-secondary');
  });

  it('applies ghost variant styles', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:bg-accent/50');
  });

  it('applies link variant styles', () => {
    render(<Button variant="link">Link</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('underline-offset-4');
  });

  it('applies small size styles', () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-8');
    expect(button).toHaveClass('text-xs');
  });

  it('applies large size styles', () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-10');
    expect(button).toHaveClass('px-8');
  });

  it('applies icon size styles', () => {
    render(
      <Button size="icon" aria-label="Icon button">
        Icon
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-9');
    expect(button).toHaveClass('w-9');
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('is accessible with aria-label', () => {
    render(<Button aria-label="Accessible button">Icon</Button>);
    expect(screen.getByLabelText('Accessible button')).toBeInTheDocument();
  });

  it('supports type attribute', () => {
    render(<Button type="submit">Submit</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('supports form attribute', () => {
    render(<Button form="my-form">Submit Form</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('form', 'my-form');
  });

  it('renders as a child element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test');
    expect(link).toHaveClass('bg-primary'); // Should still have button styles
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Button</Button>);
    expect(ref).toHaveBeenCalled();
  });
});
