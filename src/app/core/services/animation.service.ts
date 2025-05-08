import { Injectable } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  query,
  stagger,
  AnimationTriggerMetadata,
} from '@angular/animations';

@Injectable({
  providedIn: 'root',
})
export class AnimationService {
  // Animation for revealing votes
  public revealVotes: AnimationTriggerMetadata = trigger('revealVotes', [
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(0.9)' }),
      animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
    ]),
  ]);

  // Animation for vote cards when selected
  public cardVote: AnimationTriggerMetadata = trigger('cardVote', [
    transition('* => selected', [
      animate(
        '200ms ease-out',
        style({ transform: 'translateY(-8px) scale(1.05)' })
      ),
    ]),
    transition('selected => *', [
      animate('150ms ease-in', style({ transform: 'translateY(0) scale(1)' })),
    ]),
  ]);

  // Animation for list items (users, results)
  public listAnimation: AnimationTriggerMetadata = trigger('listAnimation', [
    transition('* => *', [
      query(
        ':enter',
        [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger(50, [
            animate(
              '200ms ease-out',
              style({ opacity: 1, transform: 'translateY(0)' })
            ),
          ]),
        ],
        { optional: true }
      ),
    ]),
  ]);

  // Animation for starting new rounds
  public newRound: AnimationTriggerMetadata = trigger('newRound', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-20px)' }),
      animate(
        '300ms ease-out',
        style({ opacity: 1, transform: 'translateY(0)' })
      ),
    ]),
    transition(':leave', [
      animate(
        '200ms ease-in',
        style({ opacity: 0, transform: 'translateY(20px)' })
      ),
    ]),
  ]);

  // Animation for page transitions
  public pageTransition: AnimationTriggerMetadata = trigger('pageTransition', [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('300ms ease-out', style({ opacity: 1 })),
    ]),
    transition(':leave', [animate('200ms ease-in', style({ opacity: 0 }))]),
  ]);
}
