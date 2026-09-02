'use client';

import { useState, FormEvent } from 'react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function EmailSignup() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setState('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setState('loading');
    setErrorMessage('');

    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to join waitlist');
      }

      setState('success');
      setEmail('');
      
      // Reset to idle after 5 seconds
      setTimeout(() => setState('idle'), 5000);
    } catch (err) {
      setState('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (state === 'error') {
                setState('idle');
                setErrorMessage('');
              }
            }}
            placeholder="your@email.com"
            disabled={state === 'loading'}
            aria-label="Email address"
            aria-invalid={state === 'error'}
            aria-describedby={state === 'error' ? 'email-error' : undefined}
            className="flex-1 px-4 py-3 min-h-[44px] rounded-lg border-2 border-[#6B4423]/20 bg-[#F5E6D3] text-[#6B4423] placeholder-[#6B4423]/50 font-[Open_Sans] text-base focus:outline-none focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            required
          />
          <button
            type="submit"
            disabled={state === 'loading'}
            className="px-6 py-3 min-h-[44px] rounded-lg bg-[#2C5F2D] text-[#F5E6D3] font-[Montserrat] font-semibold text-base hover:bg-[#2C5F2D]/90 focus:outline-none focus:ring-2 focus:ring-[#2C5F2D] focus:ring-offset-2 focus:ring-offset-[#F5E6D3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {state === 'loading' ? 'Joining...' : 'Join the Waitlist'}
          </button>
        </div>

        {state === 'error' && (
          <p id="email-error" role="alert" className="text-red-600 text-sm font-[Open_Sans]">
            {errorMessage}
          </p>
        )}

        {state === 'success' && (
          <p role="status" className="text-[#2C5F2D] text-sm font-[Open_Sans] font-medium">
            ✓ You're on the list! We'll be in touch soon.
          </p>
        )}
      </form>

      <p className="mt-3 text-xs text-[#6B4423]/60 font-[Open_Sans] text-center">
        Be the first to know when we launch. No spam, ever.
      </p>
    </div>
  );
}
