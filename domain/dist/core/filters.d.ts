export type SpecificOperator = (param: any) => Operator;
export declare const Like: SpecificOperator;
export declare const Equals: SpecificOperator;
export declare const MoreThan: SpecificOperator;
export declare const LessThan: SpecificOperator;
export declare const In: SpecificOperator;
export type Operator = {
    type: 'like' | 'moreThan' | 'in' | 'lessThan' | 'equals';
    value: string;
};
export interface FullSingleWhere {
    type: 'like' | 'moreThan' | 'in' | 'lessThan' | 'equals';
    value: string;
    attribute: string;
}
export interface SingleWhere {
    [attribute: string]: Operator | SpecificOperator | string | number | boolean | undefined;
}
export type Where = SingleWhere | FullSingleWhere[];
export type Order = {
    [columnName: string]: 'ASC' | 'DESC';
};
export interface Filters {
    where: Where;
    order?: Order;
    skip?: number;
    take?: number;
}
