import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ArticlesFacade } from '@realworld/articles/data-access';
import { articleInitialState } from '@realworld/articles/data-access/src/lib/+state/article/article.adapter';
import { DynamicFormComponent, Field, ListErrorsComponent, NgrxFormsFacade } from '@realworld/core/forms';
import { formsInitialState } from '@realworld/core/forms/src/lib/+state/forms.adapter';
import { joinStores } from '@state-adapt/rxjs';

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

const initialState = { ...formsInitialState, structure, data: articleInitialState.data };

@Component({
  selector: 'app-article-edit',
  standalone: true,
  templateUrl: './article-edit.component.html',
  styleUrls: ['./article-edit.component.css'],
  imports: [CommonModule, DynamicFormComponent, ListErrorsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleEditComponent implements OnInit, OnDestroy {
  storeContainer = this.ngrxFormsFacade.createFormStore(
    'articleEdit',
    initialState,
    this.facade.publishArticleRequestError$,
  );
  store = this.storeContainer.store;

  errors$ = this.storeContainer.store.errors$;
  structure$ = this.storeContainer.store.structure$;
  data$ = joinStores({ article: this.facade.articleStore, form: this.store })({
    data: s => (s.form.data !== articleInitialState.data ? s.form.data : s.article.data),
  })().data$;

  constructor(private ngrxFormsFacade: NgrxFormsFacade, public facade: ArticlesFacade, private route: ActivatedRoute) {}

  ngOnInit() {
    this.facade.articleSlugUpdate$.next(this.route.snapshot.params['slug']);
  }

  ngOnDestroy() {
    this.facade.articleSlugUpdate$.next('');
  }
}
