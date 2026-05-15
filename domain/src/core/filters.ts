export type SpecificOperator = (param: any) => Operator;

export const Like: SpecificOperator = (value: string) => {
	return {
		type: 'like',
		value,
	};
};
export const Equals: SpecificOperator = (value: string) => {
	return {
		type: 'equals',
		value,
	};
};
export const MoreThan: SpecificOperator = (value: string) => {
	return {
		type: 'moreThan',
		value,
	};
};
export const LessThan: SpecificOperator = (value: string) => {
	return {
		type: 'lessThan',
		value,
	};
};
export const In: SpecificOperator = (value: string) => {
	return {
		type: 'in',
		value,
	};
};

export type Operator = {
	type: 'like' | 'moreThan' | 'in' | 'lessThan' | 'equals';
	value: string;
};

export interface SingleWhere {
	[attribute: string]: Operator | SpecificOperator | string | number | boolean | undefined;
}

export type Where = SingleWhere | SingleWhere[];

export type Order = {
	[columnName: string]: 'ASC' | 'DESC';
};

export interface Filters {
	where: Where;
	order?: Order;
	skip?: number;
	take?: number;
}
