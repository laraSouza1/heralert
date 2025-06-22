import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'linkify'
})
export class LinkifyPipe implements PipeTransform {

  transform(messageContent: string): string {
    if (!messageContent) {
      return '';
    }

    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])|(\b(www\.)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

    const transformedText = messageContent.replace(urlRegex, (url) => {
      let fullUrl = url;
      //garante que links tipo www.exemplo.com tenham http:// para funcionarem
      if (!url.match(/^(https?|ftp|file):\/\//i) && url.startsWith('www.')) {
        fullUrl = 'http://' + url;
      }
      return `<a href="${fullUrl}" target="_blank" class="chat-link">${url}</a>`;
    });

    return transformedText; //retorna a string HTML modificada, mas não sanitizada
  }

}
