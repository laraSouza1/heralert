import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateWords'
})
export class TruncateWordsPipe implements PipeTransform {

  //para cortar textos e adicionar reticencias
  transform(value: string, charLimit: number = 30): string {
    if (!value) return '';
    return value.length > charLimit
      ? value.slice(0, charLimit).trimEnd() + '...'
      : value;
  }

}
