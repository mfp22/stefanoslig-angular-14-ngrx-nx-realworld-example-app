import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntilDestroy } from '@ngneat/until-destroy';
import { ArticlesFacade } from '@realworld/articles/data-access';
import { ArticleListComponent } from '@realworld/articles/feature-articles-list/src';
import { adapt } from '@state-adapt/angular';
import { getHttpSources } from '@state-adapt/core';
import { Subject } from 'rxjs';
import { homeAdapter } from './home.adapter';
import { homeInitialState } from './home.model';
import { HomeService } from './home.service';
import { TagsListComponent } from './tags-list/tags-list.component';

@UntilDestroy()
@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, TagsListComponent, ArticleListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  listChange$ = this.articlesfacade.listChange$;
  listTagChange$ = this.articlesfacade.listTagChange$;

  listConfig$ = this.articlesfacade.listConfig$;
  isAuthenticated = false;
  unsubscribe$: Subject<void> = new Subject();

  tagsRequest = getHttpSources('[Home] [Tags]', this.homeService.getTags(), res => [true, res.tags, res]);
  homeStore = adapt(['home', homeInitialState, homeAdapter], {
    setTags: this.tagsRequest.success$,
    resetTags: this.tagsRequest.error$,
  });
  tags$ = this.homeStore.tags$;

  constructor(private articlesfacade: ArticlesFacade, private homeService: HomeService) {}
}
