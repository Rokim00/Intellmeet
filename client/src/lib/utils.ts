import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type VariantProps<T extends (...args: never[]) => unknown> =
  Omit<
    T extends (props?: infer P) => unknown
      ? P extends undefined
        ? Record<string, never>
        : P
      : Record<string, never>,
    "className" | "class"
  >

type ConfigSchema = Record<string, Record<string, ClassValue>>

type ConfigVariants<T extends ConfigSchema> = {
  [Variant in keyof T]?: keyof T[Variant] | null | undefined
}

type Config<T extends ConfigSchema> = {
  variants?: T
  defaultVariants?: ConfigVariants<T>
  compoundVariants?: Array<ConfigVariants<T> & { className?: ClassValue; class?: ClassValue }>
}

export function cva<T extends ConfigSchema>(
  base?: ClassValue,
  config?: Config<T>
) {
  return (props?: ConfigVariants<T> & { className?: ClassValue; class?: ClassValue }) => {
    if (!config?.variants) {
      return cn(base, props?.className, props?.class)
    }

    const { variants, defaultVariants, compoundVariants } = config

    const variantClasses = Object.keys(variants).map((variantName) => {
      const variantProp = props?.[variantName]
      const defaultVariantProp = defaultVariants?.[variantName]
      const chosenVariant = variantProp ?? defaultVariantProp

      if (chosenVariant === null || chosenVariant === undefined) return null

      return variants[variantName]?.[chosenVariant as string]
    })

    const compoundVariantClasses = compoundVariants?.map((compoundVariant) => {
      const { className: cvClass, class: cvC, ...compoundVariantOptions } = compoundVariant
      const matches = Object.entries(compoundVariantOptions).every(([key, value]) => {
        const propValue = props?.[key] ?? defaultVariants?.[key]
        return propValue === value
      })

      return matches ? (cvClass || cvC) : null
    })

    return cn(base, variantClasses, compoundVariantClasses, props?.className, props?.class)
  }
}


