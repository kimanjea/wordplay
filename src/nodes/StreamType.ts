import type { NativeTypeName } from '../native/NativeConstants';
import { STREAM_SYMBOL } from '@parser/Symbols';
import type Locale from '@locale/Locale';
import AnyType from './AnyType';
import type Context from './Context';
import { node, type Grammar, type Replacement } from './Node';
import Token from './Token';
import Symbol from './Symbol';
import Type from './Type';
import type TypeSet from './TypeSet';
import Glyphs from '../lore/Glyphs';

export const STREAM_NATIVE_TYPE_NAME = 'stream';

export default class StreamType extends Type {
    readonly stream: Token;
    readonly type: Type;

    constructor(stream: Token, type: Type) {
        super();

        this.stream = stream;
        this.type = type;

        this.computeChildren();
    }

    static make(type?: Type) {
        return new StreamType(
            new Token(STREAM_SYMBOL, Symbol.Stream),
            type ?? new AnyType()
        );
    }

    getGrammar(): Grammar {
        return [
            { name: 'stream', types: node(Symbol.Stream) },
            { name: 'type', types: node(Type) },
        ];
    }

    computeConflicts() {}

    acceptsAll(types: TypeSet, context: Context): boolean {
        return types
            .list()
            .every(
                (type) =>
                    type instanceof StreamType &&
                    this.type.accepts(type.type, context)
            );
    }

    getNativeTypeName(): NativeTypeName {
        return 'stream';
    }

    clone(replace?: Replacement) {
        return new StreamType(
            this.replaceChild('stream', this.stream, replace),
            this.replaceChild('type', this.type, replace)
        ) as this;
    }

    getNodeLocale(translation: Locale) {
        return translation.node.StreamType;
    }

    getGlyphs() {
        return Glyphs.Stream;
    }
}
