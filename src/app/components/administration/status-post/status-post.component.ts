import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-status-post',
  standalone: true,
  providers: [MessageService],
  imports: [
    ReactiveFormsModule, InputTextModule, ButtonModule, CommonModule, ToastModule, MessageModule,
    SelectModule, TextareaModule
  ],
  templateUrl: './status-post.component.html',
  styleUrl: './status-post.component.css'
})
export class StatusPostComponent implements OnInit, OnChanges {

  @Input() report: any;

  @Output() statusUpdated = new EventEmitter<{ status: string; reason: string }>();
  @Output() dialogClosed = new EventEmitter<void>();

  formGroup: FormGroup;
  reasons: any[];
  allReasons: any[] = [ //todas as razões possíveis para o status
    { label: 'Válida', value: 'justificado' },
    { label: 'Não válida', value: 'nao_justificado' },
    { label: 'Em avaliação', value: 'em_avaliacao' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {

    this.reasons = [...this.allReasons]; //inicializa as razões com todas as opções
    this.formGroup = this.fb.group({
      selectedReason: ['', Validators.required],
      statusReasonText: ['', [Validators.maxLength(360)]]
    });

    //bbserva mudanças no campo selectedReason para ajustar as validações
    this.formGroup.get('selectedReason')?.valueChanges.subscribe(value => {
      const statusReasonTextControl = this.formGroup.get('statusReasonText');

      //adiciona validação de campo obrigatório se a razão for não justificado ou justificado
      if (value === 'nao_justificado' || value === 'justificado') {
        statusReasonTextControl?.setValidators([Validators.required, Validators.maxLength(360)]);
      } else {
        statusReasonTextControl?.setValidators([Validators.maxLength(360)]);
      }
      statusReasonTextControl?.updateValueAndValidity(); //atualiza validação e estado do campo
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    this.patchFormValues(); //preenche o form com os valores da denúncia ao inicializar
  }

  ngOnChanges(changes: SimpleChanges): void {
    //detecta mudanças na propriedade report
    if (changes['report']) {
      if (this.report) {
        this.patchFormValues(); //preenche o form se houver uma denúncia
        this.filterReasonsByReportStatus();
      } else {
        this.formGroup.reset(); //reseta o form se a denúncia for nulo
        //limpa erros
        Object.keys(this.formGroup.controls).forEach(key => {
          this.formGroup.get(key)?.setErrors(null);
          this.formGroup.get(key)?.markAsPristine();
          this.formGroup.get(key)?.markAsUntouched();
        });
        this.reasons = [...this.allReasons];
        this.cdr.detectChanges();
      }
    }
  }

  //para pegar dados de uma denúncia
  private patchFormValues(): void {
    this.formGroup.reset(); //reseta form
    if (this.report) {

      //preenche o form com os dados da denúncia
      this.formGroup.patchValue({
        selectedReason: this.report.report_status || '',
        statusReasonText: this.report.status_reason_text || ''
      });
    }
  }

  //filtra o select se o status da denúncia for em_avaliacao
  private filterReasonsByReportStatus(): void {
    if (this.report && this.report.report_status === 'em_avaliacao') {
      this.reasons = this.allReasons.filter(
        (reason) => reason.value !== 'em_avaliacao' //remove em_avaliacao das opções
      );
    } else {
      this.reasons = [...this.allReasons]; //mantém todas as razões
    }
    this.cdr.detectChanges();
  }

  //verifica se o form é válido
  FormValid(): boolean {
    return this.formGroup.valid;
  }

  //para atualizar o estado
  submitStatusUpdate(): void {
    if (this.formGroup.valid) {
      //obtém os valores dos campos
      const selectedStatus = this.formGroup.get('selectedReason')?.value;
      const statusReasonText = this.formGroup.get('statusReasonText')?.value;

      //emite o evento com o status e a razão atualizados
      this.statusUpdated.emit({ status: selectedStatus, reason: statusReasonText });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Por favor, preencha todos os campos obrigatórios.',
      });
      this.formGroup.markAllAsTouched(); //para exibir erros
    }
  }

  //para fechar modal
  close(): void {
    this.dialogClosed.emit();
  }

  //para o link da postagem
  getPostLink(): string {
    if (!this.report || !this.report.post_id || !this.report.post_title) return '#';
    const slugTitle = this.slugify(this.report.post_title); //converte o título em slug
    return `${window.location.origin}/view-post/${this.report.post_id}-${slugTitle}`; //constrói o link
  }

  slugify(text: string): string {
    //converte uma string em um formato de slug (url)
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  //navega para o perfil do usuário em uma nova aba
  goToProfile(userId: number, username: string): void {
    const profileUrl = this.router.createUrlTree(['/profile-view', username]).toString();
    window.open(profileUrl, '_blank');
  }
}