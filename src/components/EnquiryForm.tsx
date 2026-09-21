import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, CheckCircle2, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { site } from '@/content/site';
import { COUNTRIES } from '@/lib/countries';
import {
  ENQUIRY_LIMITS,
  OTHER_PRODUCT,
  enquirySchema,
  matchProductOption,
  productOptionGroups,
  submitEnquiry,
  type EnquiryErrorKind,
  type EnquiryInput,
} from '@/lib/enquiry';
import { cn } from '@/lib/utils';

export interface EnquiryFormProps {
  /** Product or category to pre-select. Defaults to the ?product= query parameter. */
  product?: string;
  className?: string;
}

// 16px text on phones so iOS does not zoom the page on focus; a field the form has
// rejected is outlined as well as labelled.
const FIELD = 'text-base md:text-sm aria-[invalid=true]:border-destructive';
// 44px touch target for the single-line controls.
const CONTROL = `h-11 ${FIELD}`;

const Required = () => (
  <span aria-hidden="true" className="text-accent">
    {' '}
    *
  </span>
);

/**
 * A native <select>, not the Radix one: with some 240 countries the phone's own
 * picker, keyboard type-ahead and browser autofill all work better, and the
 * options are real DOM for the prerendered page.
 */
const NativeSelect = forwardRef<HTMLSelectElement, ComponentProps<'select'>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          CONTROL,
          'w-full appearance-none rounded-md border border-input bg-background pl-3 pr-10 text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          // Placeholder state is muted; the open list stays full-strength.
          props.value === '' && 'text-muted-foreground [&_optgroup]:text-foreground [&_option]:text-foreground',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
);
NativeSelect.displayName = 'NativeSelect';

const FormAlert = ({ children }: { children: ReactNode }) => (
  <div
    role="alert"
    className="flex items-start gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm leading-relaxed text-foreground"
  >
    <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
    <div>{children}</div>
  </div>
);

const ERROR_COPY: Record<EnquiryErrorKind, string> = {
  validation: 'Some details could not be accepted. Please check the highlighted fields and send again.',
  rate_limited:
    'Several enquiries have just been sent from your connection. Please wait a few minutes and try again.',
  server: 'Your enquiry could not be sent because of a problem on our side. Please try again in a moment.',
  network: 'Your enquiry could not be sent. Please check your internet connection and try again.',
};

type Status = { state: 'idle' } | { state: 'success' } | { state: 'error'; kind: EnquiryErrorKind };

const EnquiryForm = ({ product, className }: EnquiryFormProps) => {
  const [params] = useSearchParams();
  // The value comes from a URL, so treat it as untrusted text: one clean, short line.
  const requested = (product ?? params.get('product') ?? '')
    .replace(/\p{Cc}+/gu, ' ')
    .trim()
    .slice(0, ENQUIRY_LIMITS.product);

  // Keyed so that following another "enquire" link re-applies the prefill.
  return <EnquiryFormFields key={requested} requested={requested} className={className} />;
};

const EnquiryFormFields = ({ requested, className }: { requested: string; className?: string }) => {
  const defaultValues = useMemo<EnquiryInput>(() => {
    const matched = matchProductOption(requested);
    return {
      name: '',
      company: '',
      country: '',
      email: '',
      phone: '',
      product: matched ?? '',
      volume: '',
      // An unrecognised product still reaches the export desk, in the message.
      message: requested && !matched ? `Regarding: ${requested}\n\n` : '',
      consent: false,
    };
  }, [requested]);

  const form = useForm<EnquiryInput>({ resolver: zodResolver(enquirySchema), defaultValues });
  const { errors, isSubmitting, submitCount } = form.formState;

  const [status, setStatus] = useState<Status>({ state: 'idle' });
  const honeypotId = useId();
  const honeypotRef = useRef<HTMLInputElement>(null);
  const renderedAt = useRef(Date.now());
  const successRef = useRef<HTMLDivElement>(null);

  // The confirmation replaces the form, so focus has to follow it or keyboard and
  // screen-reader users are left on a button that no longer exists.
  useEffect(() => {
    if (status.state === 'success') successRef.current?.focus();
  }, [status.state]);

  const onSubmit = async (values: EnquiryInput) => {
    setStatus({ state: 'idle' });
    const result = await submitEnquiry({
      ...values,
      website: honeypotRef.current?.value ?? '',
      renderedAt: renderedAt.current,
      submittedAt: Date.now(),
      page: window.location.pathname,
    });

    if (result.ok) {
      window.sa?.('lead', 'enquiry-submitted');
      setStatus({ state: 'success' });
      return;
    }
    for (const field of result.fields) {
      form.setError(field, { type: 'server', message: 'Please check this field.' });
    }
    setStatus({ state: 'error', kind: result.error ?? 'server' });
  };

  const sendAnother = () => {
    form.reset(defaultValues);
    renderedAt.current = Date.now();
    setStatus({ state: 'idle' });
  };

  if (status.state === 'success') {
    return (
      <div
        ref={successRef}
        role="status"
        tabIndex={-1}
        className={cn('scroll-mt-32 rounded-md border border-border bg-secondary/60 p-8 outline-none md:p-10', className)}
      >
        <CheckCircle2 aria-hidden="true" className="h-8 w-8 text-accent" />
        <h3 className="mt-5 text-2xl font-medium text-foreground md:text-3xl">Thank you. Your enquiry has been sent.</h3>
        <div className="rule mt-5" aria-hidden="true" />
        <p className="mt-5 max-w-prose leading-relaxed text-muted-foreground">
          We have received your details and will reply to the email address you provided.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
          <Link
            to="/products"
            className="inline-flex min-h-11 items-center text-[13px] font-semibold uppercase tracking-[0.18em] text-accent underline-offset-4 hover:underline"
          >
            View our products
          </Link>
          <button
            type="button"
            onClick={sendAnother}
            className="inline-flex min-h-11 items-center text-[13px] font-semibold uppercase tracking-[0.18em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Send another enquiry
          </button>
        </div>
      </div>
    );
  }

  const hasFieldErrors = submitCount > 0 && Object.keys(errors).length > 0;

  return (
    <Form {...form}>
      {/*
        Identified to the analytics tracker by `name`, not data-lead: the tracker
        records a lead for every click inside a [data-lead] element, which on a form
        would count each field a visitor touches. With `name` it records one
        "enquiry-form" per submit attempt; a delivered enquiry is "enquiry-submitted".
      */}
      <form
        name="enquiry-form"
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-6', className)}
      >
        <p className="text-sm text-muted-foreground">
          Fields marked <span className="text-accent">*</span> are required.
        </p>

        <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Full name
                  <Required />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="name"
                    aria-required="true"
                    maxLength={ENQUIRY_LIMITS.name}
                    className={CONTROL}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Company
                  <Required />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="organization"
                    aria-required="true"
                    maxLength={ENQUIRY_LIMITS.company}
                    className={CONTROL}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Country
                  <Required />
                </FormLabel>
                <FormControl>
                  <NativeSelect {...field} autoComplete="country-name" aria-required="true">
                    <option value="" disabled>
                      Select country
                    </option>
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </NativeSelect>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Business email
                  <Required />
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    aria-required="true"
                    maxLength={ENQUIRY_LIMITS.email}
                    className={CONTROL}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone / WhatsApp</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={ENQUIRY_LIMITS.phone}
                    className={CONTROL}
                  />
                </FormControl>
                <FormDescription>Optional. Please include the country code.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="product"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Product of interest
                  <Required />
                </FormLabel>
                <FormControl>
                  <NativeSelect {...field} aria-required="true">
                    <option value="" disabled>
                      Select product
                    </option>
                    {productOptionGroups.map((group) => (
                      <optgroup key={group.label} label={group.label}>
                        {group.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <option value={OTHER_PRODUCT}>{OTHER_PRODUCT}</option>
                  </NativeSelect>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="volume"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Estimated volume</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="off" maxLength={ENQUIRY_LIMITS.volume} className={CONTROL} />
                </FormControl>
                <FormDescription>Optional. Quantity per shipment, per month or per year.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>
                  Message
                  <Required />
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={7}
                    autoComplete="off"
                    aria-required="true"
                    maxLength={ENQUIRY_LIMITS.messageMax}
                    className={cn('min-h-[168px] leading-relaxed', FIELD)}
                  />
                </FormControl>
                <FormDescription>
                  Destination market, packing and any specification requirements help us respond precisely.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Honeypot: off-screen, out of the tab order and hidden from assistive tech. */}
        <div aria-hidden="true" className="sr-only">
          <label htmlFor={honeypotId}>Website</label>
          <input ref={honeypotRef} id={honeypotId} type="text" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem className="flex items-start gap-3 space-y-0 border-t border-border pt-6">
              {/* The ::before grows the 20px box to a 44px touch target. */}
              <FormControl>
                <Checkbox
                  ref={field.ref}
                  name={field.name}
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  onBlur={field.onBlur}
                  aria-required="true"
                  className="relative mt-0.5 h-5 w-5 before:absolute before:-inset-3 before:content-[''] aria-[invalid=true]:border-destructive"
                />
              </FormControl>
              <div className="space-y-1.5">
                <FormLabel className="block text-sm font-normal leading-relaxed">
                  I confirm I am a tobacco trade professional of legal age and I agree to {site.shortName}{' '}
                  contacting me about this enquiry.
                  <Required />
                </FormLabel>
                <FormDescription>
                  See the{' '}
                  {/* New tab, so reading the notice does not discard a half-written enquiry. */}
                  <Link
                    to="/privacy"
                    target="_blank"
                    rel="noopener"
                    className="font-medium text-accent underline underline-offset-4"
                  >
                    Privacy Notice
                    <span className="sr-only"> (opens in a new tab)</span>
                  </Link>
                  .
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {hasFieldErrors && status.state !== 'error' && (
          <FormAlert>Please complete the highlighted fields, then send your enquiry again.</FormAlert>
        )}

        {status.state === 'error' && (
          <FormAlert>
            {ERROR_COPY[status.kind]}
            {status.kind !== 'validation' && site.contact.email && (
              <>
                {' '}
                You can also email us at{' '}
                <a
                  href={`mailto:${site.contact.email}`}
                  data-lead="enquiry-error-email"
                  className="font-medium text-accent underline underline-offset-4"
                >
                  {site.contact.email}
                </a>
                .
              </>
            )}
          </FormAlert>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="h-12 w-full bg-accent px-10 text-[13px] font-semibold uppercase tracking-[0.18em] text-accent-foreground hover:bg-accent/90 sm:w-auto"
        >
          {isSubmitting && <Loader2 aria-hidden="true" className="animate-spin" />}
          {isSubmitting ? 'Sending…' : 'Send enquiry'}
        </Button>
      </form>
    </Form>
  );
};

export default EnquiryForm;
