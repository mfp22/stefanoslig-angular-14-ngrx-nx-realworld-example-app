import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Validators } from '@angular/forms';
import { ArticlesFacade } from '@realworld/articles/data-access';
import { Article } from '@realworld/core/api-types/src';
import { DynamicFormComponent, Field, ListErrorsComponent, NgrxFormsFacade } from '@realworld/core/forms';
import { formsAdapter, formsInitialState } from '@realworld/core/forms/src/lib/+state/forms.adapter';
import { Adapt } from '@state-adapt/ngrx';
import { map, publishReplay, refCount, switchMap } from 'rxjs';

const structure: Field[] = [
  {
    type: 'INPUT',
    name: 'title',
    placeholder: 'Article Title',
    validator: [Validators.required],
  },
  {
    type: 'INPUT',
    name: 'description',
    placeholder: "What's this article about?",
    validator: [Validators.required],
  },
  {
    type: 'TEXTAREA',
    name: 'body',
    placeholder: 'Write your article (in markdown)',
    validator: [Validators.required],
  },
  {
    type: 'INPUT',
    name: 'tagList',
    placeholder: 'Enter Tags',
    validator: [],
  },
];

@Component({
  selector: 'app-article-edit',
  standalone: true,
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.css'],
  imports: [CommonModule, DynamicFormComponent, ListErrorsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleEditComponent implements OnDestroy {
  store$ = this.facade.article$.pipe(
    map(article => {
      const initialState = { ...formsInitialState, structure, data: article };
      // const error$ = this.submitRequest.error$.pipe(map(action => ({ ...action, payload: { error: action.payload } })));
      return this.ngrxFormsFacade.createFormStore('articleEdit', initialState);
    }),
    publishReplay(1),
    refCount(),
  );
  sources$ = this.store$.pipe(map(store => store.sources));
  errors$ = this.store$.pipe(switchMap(store => store.store.errors$));

  spyStore = this.adapt.spy('articleEdit.form', formsAdapter);
  structure$ = this.spyStore.structure$;
  data$ = this.spyStore.data$;

  constructor(private adapt: Adapt, private ngrxFormsFacade: NgrxFormsFacade, private facade: ArticlesFacade) {}

  submit(article: Article) {
    this.facade.publishArticle(article);
  }

  ngOnDestroy() {
    this.facade.initializeArticle();
  }
}
