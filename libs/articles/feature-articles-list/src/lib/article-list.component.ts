import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { articleListInitialState, ArticlesFacade, initialListConfig, ListType } from '@realworld/articles/data-access';
import { ArticleListItemComponent } from './article-list-item/article-list-item.component';

@Component({
  selector: 'app-article-list',
  standalone: true,
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.css'],
  imports: [CommonModule, ArticleListItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleListComponent {
  listPageChange$ = this.facade.listPageChange$;
  favorite$ = this.facade.favorite$;
  unfavorite$ = this.facade.unfavorite$;

  isHome = (this.route.snapshot.data as any).isHome as boolean;
  isFavorites = (this.route.snapshot.data as any).isFavorites as boolean;
  isUsername = !!this.route.snapshot.params['username'];
  filters = this.isFavorites
    ? {
        ...initialListConfig.filters,
        favorited: this.route.snapshot.parent?.params['username'],
      }
    : {
        ...initialListConfig.filters,
        author: this.route.snapshot.params['username'],
      };
  initialState = {
    ...initialListConfig,
    type: this.isHome ? 'DEFAULT' : ('ALL' as ListType),
    filters: this.isUsername || this.isFavorites ? this.filters : initialListConfig.filters,
  };
  store = this.facade.createArticleListStore(this.initialState);

  totalPages$ = this.store.totalPages$;
  articles$ = this.store.articles$;
  listConfig$ = this.store.listConfig$;
  isLoading$ = this.store.isLoading$;

  constructor(private facade: ArticlesFacade, private router: Router, private route: ActivatedRoute) {}

  navigateToArticle(slug: string) {
    this.router.navigate(['/article', slug]);
  }
}
