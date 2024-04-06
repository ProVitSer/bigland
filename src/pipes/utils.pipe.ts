import { ValidationError } from 'class-validator';

export const ValidationExceptionFactory = (validationErrors: ValidationError[]) => {

    const formattedErrors = [];

    formatErrors(validationErrors, formattedErrors);

    return formattedErrors;

};

function formatErrors(validationErrors: ValidationError[], formattedErrors: any[]) {

    return validationErrors.map((err) => {

        for (const property in err.constraints) {

            formattedErrors.push({
                message: err.constraints[property],
                field: err.property,
                from: err.target.constructor.name,
            });
            
        }

        if (Array.isArray(err.children)) {

            formatErrors(err.children, formattedErrors);

        }

    });
}