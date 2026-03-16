export interface PromptOption {
  label: string;
  value: string;
}

export interface PromptSelectInput {
  question: string;
  options: PromptOption[];
}

export interface PromptSelectOutput {
  selected: string;
}

export interface PromptMultiSelectInput {
  question: string;
  options: PromptOption[];
  min?: number;
  max?: number;
}

export interface PromptMultiSelectOutput {
  selected: string[];
}

export interface PromptTextInputInput {
  question: string;
  placeholder?: string;
  multiline?: boolean;
}

export interface PromptTextInputOutput {
  text: string;
}

export interface PromptConfirmInput {
  question: string;
  confirmLabel?: string;
  denyLabel?: string;
}

export interface PromptConfirmOutput {
  confirmed: boolean;
}

export type FormFieldDef =
  | { type: "text"; name: string; label: string; placeholder?: string; required?: boolean }
  | { type: "textarea"; name: string; label: string; placeholder?: string; required?: boolean }
  | {
      type: "select";
      name: string;
      label: string;
      options: PromptOption[];
      required?: boolean;
    }
  | {
      type: "number";
      name: string;
      label: string;
      min?: number;
      max?: number;
      required?: boolean;
    };

export interface PromptFormInput {
  title?: string;
  fields: FormFieldDef[];
}

export interface PromptFormOutput {
  values: Record<string, string | number>;
}

export const PROMPT_TOOL_IDS = [
  "prompt.select",
  "prompt.multi_select",
  "prompt.text_input",
  "prompt.confirm",
  "prompt.form",
] as const;

export type PromptToolId = (typeof PROMPT_TOOL_IDS)[number];
