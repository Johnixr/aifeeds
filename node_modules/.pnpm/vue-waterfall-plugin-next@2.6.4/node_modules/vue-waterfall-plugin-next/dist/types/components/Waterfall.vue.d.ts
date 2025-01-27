import type { PropType } from 'vue';
import type { ViewCard } from '../types/waterfall';
declare const _default: import("vue").DefineComponent<{
    list: {
        type: PropType<ViewCard[]>;
        default: () => never[];
    };
    rowKey: {
        type: StringConstructor;
        default: string;
    };
    imgSelector: {
        type: StringConstructor;
        default: string;
    };
    width: {
        type: NumberConstructor;
        default: number;
    };
    breakpoints: {
        type: ObjectConstructor;
        default: () => {
            1200: {
                rowPerView: number;
            };
            800: {
                rowPerView: number;
            };
            500: {
                rowPerView: number;
            };
        };
    };
    gutter: {
        type: NumberConstructor;
        default: number;
    };
    hasAroundGutter: {
        type: BooleanConstructor;
        default: boolean;
    };
    posDuration: {
        type: NumberConstructor;
        default: number;
    };
    animationPrefix: {
        type: StringConstructor;
        default: string;
    };
    animationEffect: {
        type: StringConstructor;
        default: string;
    };
    animationDuration: {
        type: NumberConstructor;
        default: number;
    };
    animationDelay: {
        type: NumberConstructor;
        default: number;
    };
    animationCancel: {
        type: BooleanConstructor;
        default: boolean;
    };
    backgroundColor: {
        type: StringConstructor;
        default: string;
    };
    lazyload: {
        type: BooleanConstructor;
        default: boolean;
    };
    loadProps: {
        type: ObjectConstructor;
        default: () => void;
    };
    crossOrigin: {
        type: BooleanConstructor;
        default: boolean;
    };
    delay: {
        type: NumberConstructor;
        default: number;
    };
    align: {
        type: StringConstructor;
        default: string;
    };
}, {
    colWidth: import("vue").ComputedRef<number>;
    waterfallWrapper: any;
    wrapperHeight: import("vue").Ref<number>;
    getRenderURL: (item: ViewCard) => string;
    getKey: (item: ViewCard, index: number) => string;
    renderer: () => void;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    list?: unknown;
    rowKey?: unknown;
    imgSelector?: unknown;
    width?: unknown;
    breakpoints?: unknown;
    gutter?: unknown;
    hasAroundGutter?: unknown;
    posDuration?: unknown;
    animationPrefix?: unknown;
    animationEffect?: unknown;
    animationDuration?: unknown;
    animationDelay?: unknown;
    animationCancel?: unknown;
    backgroundColor?: unknown;
    lazyload?: unknown;
    loadProps?: unknown;
    crossOrigin?: unknown;
    delay?: unknown;
    align?: unknown;
} & {
    breakpoints: Record<string, any>;
    gutter: number;
    hasAroundGutter: boolean;
    width: number;
    animationDelay: number;
    animationDuration: number;
    backgroundColor: string;
    list: ViewCard[];
    rowKey: string;
    imgSelector: string;
    posDuration: number;
    animationPrefix: string;
    animationEffect: string;
    animationCancel: boolean;
    lazyload: boolean;
    loadProps: Record<string, any>;
    crossOrigin: boolean;
    delay: number;
    align: string;
} & {}>, {
    breakpoints: Record<string, any>;
    gutter: number;
    hasAroundGutter: boolean;
    width: number;
    animationDelay: number;
    animationDuration: number;
    backgroundColor: string;
    list: ViewCard[];
    rowKey: string;
    imgSelector: string;
    posDuration: number;
    animationPrefix: string;
    animationEffect: string;
    animationCancel: boolean;
    lazyload: boolean;
    loadProps: Record<string, any>;
    crossOrigin: boolean;
    delay: number;
    align: string;
}>;
export default _default;
