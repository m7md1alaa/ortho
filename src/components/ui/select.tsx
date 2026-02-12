import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("px-3 py-2", className)}
      {...props}
    />
  );
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 items-center text-left font-body", className)}
      {...props}
    />
  );
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default" | "lg";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        // Base styles
        "group relative inline-flex items-center justify-between",
        "font-body text-[15px] tracking-wide",
        "border border-border-custom bg-bg-secondary/50",
        "text-text-primary placeholder:text-text-muted",
        "transition-all duration-300 ease-out",
        "outline-none select-none cursor-pointer",

        // Hover state
        "hover:border-accent-muted hover:bg-bg-secondary",

        // Focus state - editorial accent
        "focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20",

        // Invalid state
        "aria-invalid:border-destructive/60 aria-invalid:ring-2 aria-invalid:ring-destructive/20",

        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border-custom",

        // Size variants - improved spacing
        "data-[size=sm]:h-9 data-[size=sm]:px-3 data-[size=sm]:py-1.5 data-[size=sm]:text-sm data-[size=sm]:rounded-md",
        "data-[size=default]:h-11 data-[size=default]:px-4 data-[size=default]:py-2.5 data-[size=default]:rounded-lg",
        "data-[size=lg]:h-13 data-[size=lg]:px-5 data-[size=lg]:py-3 data-[size=lg]:text-base data-[size=lg]:rounded-xl",

        // Icon spacing
        "gap-3",
        "[&_svg:not([class*='size-'])]:size-[18px]",
        "[&_svg]:transition-transform [&_svg]:duration-300",

        // Value slot styling
        "*:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center",
        "*:data-[slot=select-value]:gap-2.5 *:data-[slot=select-value]:line-clamp-1",

        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="text-text-secondary shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180" />
        }
      />
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 8,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger = false,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            // Base styles - editorial design
            "bg-bg-secondary/95 backdrop-blur-xl",
            "border border-border-light shadow-2xl shadow-black/40",
            "text-text-primary font-body",
            "rounded-xl overflow-hidden",

            // Editorial paper texture overlay
            'before:absolute before:inset-0 before:bg-[url(\'data:image/svg+xml,%3Csvg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E\')] before:opacity-[0.02] before:pointer-events-none',

            // Size constraints
            "min-w-48 max-h-(--available-height)",
            "w-(--anchor-width) origin-(--transform-origin)",

            // Animation states
            "data-open:animate-in data-closed:animate-out",
            "data-closed:fade-out-0 data-open:fade-in-0",
            "data-closed:zoom-out-[0.98] data-open:zoom-in-[0.98]",
            "data-[side=bottom]:slide-in-from-top-1",
            "data-[side=top]:slide-in-from-bottom-1",
            "data-[side=left]:slide-in-from-right-1",
            "data-[side=right]:slide-in-from-left-1",
            "duration-200 ease-out",

            // Positioning
            "relative isolate z-50 overflow-x-hidden overflow-y-auto",

            className,
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List className="py-2">
            {children}
          </SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn(
        "px-4 pt-3 pb-2",
        "font-mono text-[10px] uppercase tracking-[0.2em]",
        "text-accent font-medium",
        "select-none pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        // Base styles
        "relative flex items-center w-full",
        "px-4 py-2.5 mx-2 rounded-md",
        "text-[15px] leading-relaxed tracking-wide",
        "font-body text-text-primary",
        "cursor-pointer select-none outline-none",
        "transition-all duration-200 ease-out",

        // Hover state - subtle highlight
        "hover:bg-bg-tertiary/80 hover:text-text-primary",
        "hover:shadow-[inset_1px_0_0_0_var(--color-accent)]",

        // Focus state
        "focus:bg-bg-tertiary focus:text-text-primary",
        "focus:shadow-[inset_1px_0_0_0_var(--color-accent)]",

        // Selected state - editorial accent
        "data-[selected]:bg-accent-muted/30",
        "data-[selected]:text-text-primary",
        "data-[selected]:shadow-[inset_2px_0_0_0_var(--color-accent)]",

        // Disabled state
        "data-disabled:pointer-events-none data-disabled:opacity-40",

        // Check icon spacing
        "pr-10",

        // Icon sizing
        "[&_svg:not([class*='size-'])]:size-[18px]",

        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 items-center gap-2.5 truncate">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="absolute right-3 flex items-center justify-center">
            <CheckIcon className="text-accent size-[18px] stroke-[2.5]" />
          </span>
        }
      />
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn(
        "h-px mx-4 my-2",
        "bg-border-light",
        "pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "sticky top-0 z-10 flex items-center justify-center",
        "w-full h-8 cursor-default",
        "bg-gradient-to-b from-bg-secondary via-bg-secondary to-transparent",
        "text-text-secondary",
        "[&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "sticky bottom-0 z-10 flex items-center justify-center",
        "w-full h-8 cursor-default",
        "bg-linear-to-t from-bg-secondary via-bg-secondary to-transparent",
        "text-text-secondary",
        "[&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
