import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

const sw = vi.hoisted(() => ({
  offlineReady: false,
  needRefresh: false,
  update: vi.fn().mockResolvedValue(undefined),
  onError: undefined as (() => void) | undefined,
}));
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: (options: { onRegisterError: () => void }) => {
    sw.onError = options.onRegisterError;
    return {
      offlineReady: [sw.offlineReady],
      needRefresh: [sw.needRefresh],
      updateServiceWorker: sw.update,
    };
  },
}));

beforeEach(() => {
  sw.offlineReady = false;
  sw.needRefresh = false;
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
});

describe('foundation shell', () => {
  it('renders the approved heading and explicitly defers application features', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('اليوم يكفي أن تبدأ');
    expect(screen.getByText(/ستتوفر أدوات التغذية/)).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
  it('announces offline and restored connectivity', () => {
    render(<App />);
    expect(screen.getByRole('status')).toHaveTextContent('أنت متصل بالإنترنت');
    act(() => {
      Object.defineProperty(navigator, 'onLine', { configurable: true, value: false });
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByRole('status')).toHaveTextContent('أنت غير متصل بالإنترنت');
    act(() => {
      Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
      window.dispatchEvent(new Event('online'));
    });
    expect(screen.getByRole('status')).toHaveTextContent('أنت متصل بالإنترنت');
  });
  it('only announces offline readiness after precaching completes', () => {
    const view = render(<App />);
    expect(screen.queryByText('يمكنك فتح هذه الصفحة دون اتصال.')).not.toBeInTheDocument();
    sw.offlineReady = true;
    view.rerender(<App />);
    expect(screen.getByRole('status')).toHaveTextContent('يمكنك فتح هذه الصفحة دون اتصال.');
  });
  it('requires a user action to apply an available update', () => {
    sw.needRefresh = true;
    render(<App />);
    expect(sw.update).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'تحديث الآن' }));
    expect(sw.update).toHaveBeenCalledWith(true);
  });
  it('reports registration failure without hiding the shell', () => {
    render(<App />);
    act(() => sw.onError?.());
    expect(screen.getByRole('status')).toHaveTextContent('تعذر تجهيز النسخة');
    expect(screen.getByRole('main')).toBeVisible();
  });
});
