import Description from './Description';
import type Locale from './Locale';
import type NodeRef from './NodeRef';
import type ValueLink from './ValueRef';

export type TemplateInput =
    | number
    | boolean
    | string
    | undefined
    | NodeRef
    | ValueLink
    | Description;

/**
 * Takes a localization templae and converts it to a concrete string.
 * The syntax is as follows.
 * To indicate that the string has not yet been written, write an empty string or "$?":
 *
 *      ""
 *      "$?"
 *
 * To refer to an input, use a $, followed by the number of the input desired,
 * starting from 1.
 *
 *      "Hello, my name is $1"
 *
 * To indicate that you want to reuse a common phrase defined in a locale's "terminology" dictionary,
 * use a $ followed by any number of word characters (in regex, /\$\w/). This allows
 * for terminology to be changed globally without search and replace.
 *
 *      "To create a new $program, click here."
 *
 * To conditionally select a string, use ??, followed by an input that is either a boolean or possibly undefined value,
 * and true and false cases
 *
 *      "I received $1 ?? [$1 | nothing]"
 *      "I received $1 ?? [$2 ?? [$1 | $2] | nothing]"
 *
 * To indicate that you want a literal reserved symbol, use two of them:
 *
 *      "$$"
 *      "[["
 *      "]]"
 *      "||"
 */
export default function concretize(
    locale: Locale,
    template: string,
    ...inputs: TemplateInput[]
): Description {
    return (
        concretizeOrUndefined(locale, template, ...inputs) ??
        Description.as('-')
    );
}

export function concretizeOrUndefined(
    locale: Locale,
    template: string,
    ...inputs: TemplateInput[]
) {
    // Not written? Return the TBD string.
    if (template === '' || template === '$?')
        return Description.as(locale.ui.placeholders.unwritten);

    return parseTemplate(locale, new Template(template), ...inputs);
}

export function parseTemplate(
    locale: Locale,
    template: Template,
    ...inputs: TemplateInput[]
): Description | undefined {
    let description = new Description([]);

    while (
        !template.empty() &&
        template.isnt('|') &&
        template.isnt(']') &&
        template.isnt('[')
    ) {
        // Handle the four escape characters
        if (template.is('$$')) {
            template.next(2);
            description = description.with('$');
        } else if (template.is('[[')) {
            template.next(2);
            description = description.with('[');
        } else if (template.is(']]')) {
            template.next(2);
            description = description.with(']');
        } else if (template.is('||')) {
            template.next(2);
            description = description.with('|');
        }
        // Handle $
        else if (template.is('$')) {
            // Read the $.
            template.next();
            // Is it a number? Resolve to an input.
            const numberMatch = template.matches(/^[0-9]+/);
            if (numberMatch !== null) {
                // Read the match
                template.next(numberMatch[0].length);
                // Find the corresponding input
                const number = parseInt(numberMatch[0]);
                const input = inputs[number - 1];

                // If there's a conditional after, parse one of those. Otherwise, just add the input.
                const conditionMatch = template.matches(/^\s+\?\?/);
                if (conditionMatch !== null) {
                    template.next(conditionMatch[0].length);
                    const value = parseConditional(
                        input === true || input !== undefined,
                        locale,
                        template,
                        ...inputs
                    );
                    if (value) description = description.with(value);
                    else return undefined;
                }
                // Otherwise, just add the text
                else description = description.with(input);
            } else {
                // Is it a sequence of non-whitespace characters?
                const idMatch = template.matches(/^\w+/);
                if (idMatch !== null) {
                    template.next(idMatch[0].length);
                    const id = idMatch[0] as keyof Locale['term'];
                    const phrase = Object.hasOwn(locale.term, id)
                        ? locale.term[id]
                        : '-';
                    description = description.with(phrase);
                }
            }
        }
        // Read the next character
        else {
            let text = '';
            while (
                !template.empty() &&
                template.isnt('$') &&
                template.isnt(']') &&
                template.isnt('|')
            )
                text += template.next();
            description = description.with(text);
        }
    }

    return description;
}

function parseConditional(
    yes: boolean,
    locale: Locale,
    template: Template,
    ...inputs: TemplateInput[]
): Description | undefined {
    // Read until a [
    while (!template.empty() && template.isnt('[')) template.next();

    // Error if there isn't one.
    if (template.empty() || template.isnt('[')) return undefined;
    // Read the bracket
    template.next(1);

    // Parse the yes value.
    const yesDescription = parseTemplate(locale, template, ...inputs);
    if (yesDescription === undefined) return undefined;

    // Read until a |
    while (!template.empty() && template.isnt('|')) template.next();

    // Error if there isn't one.
    if (template.empty() || template.isnt('|')) return undefined;
    // Read the |
    template.next();

    // Parse the no value.
    const noDescription = parseTemplate(locale, template, ...inputs);
    if (noDescription === undefined) return undefined;

    // Read until a ]
    while (!template.empty() && template.isnt(']')) template.next();

    // Error if there isn't one.
    if (template.empty() || template.isnt(']')) return undefined;
    // Read the bracket
    template.next();

    return yes ? yesDescription : noDescription;
}

class Template {
    text: string;

    constructor(text: string) {
        this.text = text;
    }

    next(len: number = 1): string {
        const c = this.peek();
        this.text = this.text.substring(len);
        return c;
    }

    peek(): string {
        return this.text.charAt(0);
    }

    empty(): boolean {
        return this.text.length === 0;
    }

    is(s: string): boolean {
        return this.text.startsWith(s);
    }

    matches(re: RegExp) {
        return this.text.match(re);
    }

    isnt(s: string): boolean {
        return !this.text.startsWith(s);
    }
}