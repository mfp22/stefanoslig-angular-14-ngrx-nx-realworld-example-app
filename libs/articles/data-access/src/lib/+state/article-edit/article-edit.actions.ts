import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Article } from '@realworld/core/api-types/src';

export const articleEditActions = createActionGroup({
  source: 'Article Edit',
  events: {
    'Publish Article': props<{ article: Article }>(),
    'Publish Article Success': emptyProps(),
  },
});
