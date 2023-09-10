import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isE164', async: false })
export class IsE164Constraint implements ValidatorConstraintInterface {
  validate(value: string, _: ValidationArguments) {
    // Регулярное выражение для проверки формата E.164 (начинается с 7 и имеет 11 цифр)
    const e164Pattern = /^7\d{10}$/;
    return typeof value === 'string' && e164Pattern.test(value);
  }

  defaultMessage(_: ValidationArguments) {
    return 'Номер должен быть в формате E.164 (начинаться с 7 и иметь 11 цифр)';
  }
}
