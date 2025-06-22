import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'mention'
})
export class MentionPipe implements PipeTransform {

  transform(value: string): string { //recebe string, retorna string
    if (!value) return '';

    const mentionRegex = /@([\w.-]+)/g;
    //substitui as menções por spans com a classe e o atributo de dados
    const replaced = value.replace(mentionRegex, `<span class="mention" data-username="$1">@$1</span>`);

    return replaced; //retorna a string HTML modificada, mas não sanitizada
  }
}
