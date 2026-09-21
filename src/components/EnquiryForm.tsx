import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ChevronDown } from 'lucide-react';
import Magnetic from '@/components/motion/Magnetic';
import SplitReveal from '@/components/motion/SplitReveal';
import { CtaPill } from '@/components/ui/button';
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
import { FIELD, FieldRule, Input } from '@/components/ui/input';
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
import { EASE, useReveal } from '@/lib/motion';
import { cn } from '@/lib/utils';

export interface EnquiryFormProps {
  /** Product or category to pre-select. Defaults to the ?product= query parameter. */
  product?: string;
  className?: string;
}

// Label, field, then help and error text; `group` lets the label warm while its field has focus.
const ITEM = 'group space-y-1.5';
const HELP = 'pt-1.5 text-[13px] leading-relaxed';
// Validation text is mounted only when there is something to say, so it can arrive.
const MESSAGE = 'pt-1 text-[13px] animate-in fade-in slide-in-from-top-1 duration-500 ease-expo-out';
const TEXT_LINK = 'link-underline inline-block bg-origin-content py-3 text-[13px] font-semibold uppercase tracking-[0.18em]';

const Required = () => (
  <span aria-hidden="true" className="text-accent">
    {' '}
    *
  </span>
);

/** A numbered part of the form: "01 Your details". The legend names the group to assistive tech. */
const FieldGroup = ({ index, title, children }: { index: string; title: string; children: ReactNode }) => (
  // min-w-0: a fieldset is otherwise as wide as its longest <option>, which overflows a phone.
  <fieldset className="min-w-0">
    <legend className="w-full border-b border-border pb-4">
      <span className="flex items-baseline gap-4">
        <span aria-hidden="true" className="font-display text-base italic text-accent">
          {index}
        </span>
        <span className="font-sans text-xs font-semibold uppercase tracking-[0.24em] text-foreground">{title}</span>
      </span>
    </legend>
    <div className="grid gap-x-10 gap-y-9 pt-9 sm:grid-cols-2">{children}</div>
  </fieldset>
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
          FIELD,
          // A real background (the page's): the browser paints the open list with it,
          // and a transparent one would come out white under the dark theme's light text.
          'h-12 cursor-pointer appearance-none truncate bg-background pr-9',
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
        strokeWidth={1.5}
        className="pointer-events-none absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-[transform,color] duration-500 ease-expo-out peer-hover:translate-y-[calc(-50%+3px)] peer-focus-visible:translate-y-[calc(-50%+3px)] peer-focus-visible:text-accent"
      />
      <FieldRule />
    </div>
  )
);
NativeSelect.displayName = 'NativeSelect';

const FormAlert = ({ children }: { children: ReactNode }) => (
  <div
    role="alert"
    className="flex items-start gap-4 border-l-2 border-destructive bg-destructive/5 py-4 pl-5 pr-4 text-sm leading-relaxed text-foreground animate-in fade-in slide-in-from-top-1 duration-500 ease-expo-out"
  >
    <AlertCircle aria-hidden="true" strokeWidth={1.5} className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
    <div>{children}</div>
  </div>
);

/** The confirmation mark: the ring settles, then the tick is wiped in the way a pen makes it. */
const DrawnCheck = () => {
  const shown = useReveal(true);
  return (
    <span aria-hidden="true" className="relative flex h-16 w-16 items-center justify-center text-accent">
      <span
        className="absolute inset-0 rounded-full border border-current"
        style={{
          opacity: shown ? 1 : 0,
          transform: shown ? 'none' : 'scale(0.6)',
          transition: `opacity 0.7s ${EASE.expoOut}, transform 0.9s ${EASE.expoOut}`,
        }}
      />
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="h-8 w-8"
        style={{
          clipPath: shown ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
          transition: `clip-path 0.8s ${EASE.expoOut} 0.3s`,
        }}
      >
        <path d="M6 16.8l6.6 6.4L26 9.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
};

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
        className={cn('scroll-mt-32 border-t border-foreground pt-10 outline-none md:pt-14', className)}
      >
        <DrawnCheck />
        <SplitReveal
          as="h3"
          by="line"
          delay={0.25}
          text="Thank you. Your enquiry has been sent."
          className="mt-8 max-w-[14ch] text-4xl font-medium leading-[1.05] tracking-[-0.025em] text-foreground md:text-5xl"
        />
        <div className="rule mt-8" aria-hidden="true" />
        <p className="mt-8 max-w-prose leading-relaxed text-muted-foreground">
          We have received your details and will reply to the email address you provided.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-1">
          <Link to="/products" className={cn(TEXT_LINK, 'rounded-sm text-accent')}>
            View our products
          </Link>
          <button
            type="button"
            onClick={sendAnother}
            className={cn(
              TEXT_LINK,
              'rounded-sm text-muted-foreground transition-colors duration-300 ease-quart-out hover:text-foreground'
            )}
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
        className={cn('space-y-14', className)}
      >
        <FieldGroup index="01" title="Your details">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className={ITEM}>
                <FormLabel>
                  Full name
                  <Required />
                </FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="name" aria-required="true" maxLength={ENQUIRY_LIMITS.name} />
                </FormControl>
                <FormMessage className={MESSAGE} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem className={ITEM}>
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
                  />
                </FormControl>
                <FormMessage className={MESSAGE} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem className={ITEM}>
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
                <FormMessage className={MESSAGE} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className={ITEM}>
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
                  />
                </FormControl>
                <FormMessage className={MESSAGE} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className={ITEM}>
                <FormLabel>Phone / WhatsApp</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={ENQUIRY_LIMITS.phone}
                  />
                </FormControl>
                <FormDescription className={HELP}>Optional. Please include the country code.</FormDescription>
                <FormMessage className={MESSAGE} />
              </FormItem>
            )}
          />
        </FieldGroup>

        <FieldGroup index="02" title="Your requirement">
          <FormField
            control={form.control}
            name="product"
            render={({ field }) => (
              <FormItem className={ITEM}>
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
                <FormMessage className={MESSAGE} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="volume"
            render={({ field }) => (
              <FormItem className={ITEM}>
                <FormLabel>Estimated volume</FormLabel>
                <FormControl>
                  <Input {...field} autoComplete="off" maxLength={ENQUIRY_LIMITS.volume} />
                </FormControl>
                <FormDescription className={HELP}>Optional. Quantity per shipment, per month or per year.</FormDescription>
                <FormMessage className={MESSAGE} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className={cn(ITEM, 'sm:col-span-2')}>
                <FormLabel>
                  Message
                  <Required />
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={5}
                    autoComplete="off"
                    aria-required="true"
                    maxLength={ENQUIRY_LIMITS.messageMax}
                  />
                </FormControl>
                <FormDescription className={HELP}>
                  Destination market, packing and any specification requirements help us respond precisely.
                </FormDescription>
                <FormMessage className={MESSAGE} />
              </FormItem>
            )}
          />
        </FieldGroup>

        {/* Honeypot: off-screen, out of the tab order and hidden from assistive tech. */}
        <div aria-hidden="true" className="sr-only">
          <label htmlFor={honeypotId}>Website</label>
          <input ref={honeypotRef} id={honeypotId} type="text" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="space-y-8 border-t border-border pt-9">
          <FormField
            control={form.control}
            name="consent"
            render={({ field }) => (
              <FormItem className="flex items-start gap-4 space-y-0">
                {/* The ::before grows the 20px box to a 44px touch target. */}
                <FormControl>
                  <Checkbox
                    ref={field.ref}
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    onBlur={field.onBlur}
                    aria-required="true"
                    className="relative mt-0.5 before:absolute before:-inset-3 before:content-[''] aria-[invalid=true]:border-destructive"
                  />
                </FormControl>
                <div className="space-y-1.5">
                  {/* A sentence, not a field name: the label's small caps are set aside here. */}
                  <FormLabel className="cursor-pointer text-sm font-normal normal-case leading-relaxed tracking-normal text-foreground">
                    I confirm I am a tobacco trade professional of legal age and I agree to {site.shortName}{' '}
                    contacting me about this enquiry.
                    <Required />
                  </FormLabel>
                  <FormDescription className="text-[13px] leading-relaxed">
                    See the{' '}
                    {/* New tab, so reading the notice does not discard a half-written enquiry. */}
                    <Link
                      to="/privacy"
                      target="_blank"
                      rel="noopener"
                      className="link-underline rounded-sm font-medium text-accent"
                    >
                      Privacy Notice
                      <span className="sr-only"> (opens in a new tab)</span>
                    </Link>
                    .
                  </FormDescription>
                  <FormMessage className={MESSAGE} />
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

          <div className="flex flex-col gap-x-8 gap-y-4 sm:flex-row sm:items-center">
            <Magnetic>
              {/* min-w: "Send enquiry" and "Sending…" take the same room, so nothing jumps. */}
              <CtaPill
                type="submit"
                busy={isSubmitting}
                disabled={isSubmitting}
                className="w-full sm:w-auto sm:min-w-[16rem]"
              >
                {isSubmitting ? 'Sending…' : 'Send enquiry'}
              </CtaPill>
            </Magnetic>
            <p className="text-[13px] text-muted-foreground">
              Fields marked <span className="text-accent">*</span> are required.
            </p>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default EnquiryForm;
