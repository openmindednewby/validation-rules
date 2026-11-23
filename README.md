# @dloizides/validation-rules

Field validation rules generated from the DLoizides.Validation manifest (`rules/validation-rules.json`), so the browser and the .NET services check a field with the same limits, patterns and error codes.

Do not edit `src/index.ts` by hand. Regenerate it in `NuGetPackages/Validation.Defaults`:

```bash
node tools/generate-validation-rules.mjs --ts-out <path to this package>
```

## Install

```bash
npm install @dloizides/validation-rules
```

## Usage

```ts
import { validateUsername, ValidationCodes, ValidationLimits } from '@dloizides/validation-rules';

const codes = validateUsername('a b');
const tooLong = codes.includes(ValidationCodes.TooLong);
```

Each `validate<Kind>` returns the list of failed `ValidationCode`s; an empty list means the value is valid. `fieldKindValidators` maps a field kind to its validator.

## License

MIT
