import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsDateFormat(validationOptions?: ValidationOptions) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDateFormat',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate(value: any, args: ValidationArguments) {
          const datePattern = /^\d{2}\.\d{2}\.\d{4}$/; // Регулярное выражение для формата "DD.MM.YYYY"
          if (typeof value !== 'string' || !datePattern.test(value)) {
            return false;
          }
          const [day, month, year] = value.split('.');
          const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));
          return (
            parsedDate.getDate() === Number(day) && parsedDate.getMonth() === Number(month) - 1 && parsedDate.getFullYear() === Number(year)
          );
        },
      },
    });
  };
}
