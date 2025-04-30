import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'mention'
})
export class MentionPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return value;

    const mentionRegex = /@(\w+)/g;
    const replaced = value.replace(mentionRegex, `<span class="mention" data-username="$1">@$1</span>`);

    return this.sanitizer.bypassSecurityTrustHtml(replaced);
  }
}