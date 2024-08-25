import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthStateService } from '@realworld/auth/feature-auth';
import { injectAutoSignal, memo } from '@realworld/signals';
import { AddCommentComponent } from './add-comment/add-comment.component';
import { ArticleCommentComponent } from './article-comment/article-comment.component';
import { ArticleMetaComponent } from './article-meta/article-meta.component';
import { ArticleStateService } from './article-state.service';
import { MarkdownPipe } from './pipes/markdown.pipe';
import { CommentStateService } from './comment-state.service';

@Component({
  selector: 'cdt-article',
  standalone: true,
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    ArticleMetaComponent,
    ArticleCommentComponent,
    MarkdownPipe,
    AddCommentComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleComponent {
  authStateService = injectAutoSignal(AuthStateService);
  commentStateService = injectAutoSignal(CommentStateService);
  articleStateService = injectAutoSignal(ArticleStateService);
  canModify = memo(
    () =>
      this.articleStateService.authorUsername() ===
      this.authStateService.user().username,
  );
}
