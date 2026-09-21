import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Magnetic from '@/components/motion/Magnetic';
import SplitReveal from '@/components/motion/SplitReveal';
import { CtaButton } from '@/components/ui/button';
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

/*
 * The form is a ruled sheet, not a stack of boxes. Every field is one CELL of a
 * two-column grid: a hairline above it, the mono label, the rule to write on
 * (ui/input), then help and error text. The cells share their lines — the right-hand
 * column draws the one vertical divider, the grid itself the closing rule — and the
 * left column keeps the page's own left edge, so labels line up with the headline.
 * `group` lets the label turn to the accent while its field has focus.
 */
const CELL = 'group min-w-0 space-y-2 border-t border-border pb-7 pt-5';
const CELL_LEFT = `${CELL} sm:pr-8`;
const CELL_RIGHT = `${CELL} sm:border-l sm:pl-8`;
const CELL_WIDE = `${CELL} sm:col-span-2`;
const HELP = 'pt-1';
// Validation text is mounted only when there is something to say, so it can arrive.
const MESSAGE = 'pt-1 animate-in fade-in slide-in-from-top-1 duration-500 ease-expo-out';
// A directory row that is a link: the label shifts 8px and the arrow darkens, nothing more.
const ROW_LINK = 'mono-label group/row flex min-h-14 w-full items-center justify-between gap-6 text-left text-foreground';
const ROW_LABEL = 'transition-transform group-hover/row:translate-x-2 group-focus-visible/row:translate-x-2';
const ROW_ARROW =
  'h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover/row:text-accent group-focus-visible/row:text-accent';

const Required = () => (
  <span aria-hidden="true" className="text-accent">
    {' '}
    *
  </span>
);

/** A part of the form: "Your details". The legend names the group to assistive tech. */
const FieldGroup = ({ title, children }: { title: string; children: ReactNode }) => (
  // min-w-0: a fieldset is otherwise as wide as its longest <option>, which overflows a phone.
  <fieldset className="min-w-0">
    <legend className="display-xs w-full pb-6 text-foreground">{title}</legend>
    <div className="grid border-b border-border sm:grid-cols-2">{children}</div>
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
      {/* The site's own chevron in place of the platform's: it dips 2px, it does not bounce. */}
      <ChevronDown
        aria-hidden="true"
        strokeWidth={1.5}
        className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-[transform,color] peer-hover:translate-y-[calc(-50%+2px)] peer-hover:text-foreground peer-focus-visible:translate-y-[calc(-50%+2px)] peer-focus-visible:text-accent"
      />
      <FieldRule />
    </div>
  )
);
NativeSelect.displayName = 'NativeSelect';

/** A ruled note, not a tinted box: one destructive rule down its side and a mono label. */
const FormAlert = ({ children }: { children: ReactNode }) => (
  <div
    role="alert"
    className="border-l-2 border-destructive py-1 pl-5 animate-in fade-in slide-in-from-top-1 duration-500 ease-expo-out"
  >
    <p className="mono-label text-destructive">Not sent</p>
    <div className="mt-2 max-w-[38rem] text-secondary text-foreground">{children}</div>
  </div>
);

/** The confirmation mark: a square hairline frame settles, then the tick is wiped in the way a pen makes it. */
const DrawnCheck = () => {
  const shown = useReveal(true);
  return (
    <span aria-hidden="true" className="relative flex h-16 w-16 items-center justify-center text-accent">
      <span
        className="absolute inset-0 border border-current"
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
        <path d="M6 16.8l6.6 6.4L26 9.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter" />
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
        className={cn('scroll-mt-32 outline-none', className)}
      >
        {/* Ruled like the form it replaces: a mono header row, the statement, then row links. */}
        <p className="eyebrow-signal border-y border-border py-4">Enquiry received</p>
        <div className="grid gap-x-10 gap-y-8 py-12 sm:grid-cols-[4rem_1fr] md:py-16">
          <DrawnCheck />
          <div>
            <SplitReveal
              as="h3"
              by="line"
              delay={0.25}
              text="Thank you. Your enquiry has been sent."
              className="display-md max-w-[14ch] text-foreground"
            />
            <p className="mt-8 max-w-[38rem] text-body text-muted-foreground">
              We have received your details and will reply to the email address you provided.
            </p>
          </div>
        </div>
        <ul className="hairline-rows">
          <li>
            <Link to="/products" className={ROW_LINK}>
              <span className={ROW_LABEL}>View our products</span>
              <ArrowRight aria-hidden="true" className={ROW_ARROW} />
            </Link>
          </li>
          <li>
            <button type="button" onClick={sendAnother} className={ROW_LINK}>
              <span className={ROW_LABEL}>Send another enquiry</span>
              <ArrowRight aria-hidden="true" className={ROW_ARROW} />
            </button>
          </li>
        </ul>
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
        className={cn('space-y-16 md:space-y-20', className)}
      >
        <FieldGroup title="Your details">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className={CELL_LEFT}>
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
              <FormItem className={CELL_RIGHT}>
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
              <FormItem className={CELL_LEFT}>
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
              <FormItem className={CELL_RIGHT}>
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
              <FormItem className={CELL_LEFT}>
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

          {/* Five fields leave a sixth cell: it carries the sheet's one footnote, so the
              divider runs the full height and nothing is left looking unfinished. */}
          <p className={`${CELL_RIGHT} flex items-end`}>
            <span className="eyebrow">
              Fields marked <span className="text-accent">*</span> are required
            </span>
          </p>
        </FieldGroup>

        <FieldGroup title="Your requirement">
          <FormField
            control={form.control}
            name="product"
            render={({ field }) => (
              <FormItem className={CELL_LEFT}>
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
              <FormItem className={CELL_RIGHT}>
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
              <FormItem className={CELL_WIDE}>
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

        {/* The sheet above closes with its own rule, so this block needs no line of its own. */}
        <div className="space-y-8">
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
                <div className="max-w-[60ch] space-y-1.5">
                  {/* A sentence, not a field name: the label's mono caps are set aside here. */}
                  <FormLabel className="cursor-pointer font-sans text-base font-normal normal-case leading-[1.6] tracking-normal text-foreground">
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
                      // Underlined at rest: inside a sentence, colour alone must not carry the link.
                      className="rounded-sm font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
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
                    className="rounded-sm font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
                  >
                    {site.contact.email}
                  </a>
                  .
                </>
              )}
            </FormAlert>
          )}

          {/* Solid black (white in the dark theme), the full width of a phone. */}
          <Magnetic>
            {/* min-w: "Send enquiry" and "Sending…" take the same room, so nothing jumps. */}
            <CtaButton
              type="submit"
              busy={isSubmitting}
              disabled={isSubmitting}
              className="w-full sm:w-auto sm:min-w-[18rem]"
            >
              {isSubmitting ? 'Sending…' : 'Send enquiry'}
            </CtaButton>
          </Magnetic>
        </div>
      </form>
    </Form>
  );
};

export default EnquiryForm;
