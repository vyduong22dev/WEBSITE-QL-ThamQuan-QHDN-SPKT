import { Component, OnInit, TemplateRef } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { LanguageConstant } from 'src/app/core/constants/language.constant';
import { SystemConstant } from 'src/app/core/constants/system.constant';
import { UrlConstant } from 'src/app/core/constants/url.constant';
import { CauHoiKhaoSatDoanhNghiep } from 'src/app/core/models/categories/cau-hoi-khao-sat-doanh-nghiep';
import { BreadCrumb } from 'src/app/core/models/common/breadcrumb.model';
import { ModalData } from 'src/app/core/models/common/modal-data.model';
import { CauHoiKhaoSatDoanhNgiepService } from 'src/app/core/services/management/categories/cau-hoi-khao-sat-doanh-nghiep.service';
import { Paginate } from 'src/app/shared/widget/paginate/paginate.model';

@Component({
  selector: 'app-list-questions-business',
  templateUrl: './list-questions-business.component.html',
  styleUrls: ['./list-questions-business.component.scss']
})
export class ListQuestionsBusinessComponent implements OnInit {

  // Ngon ngu hien thi //////////
  langData = LanguageConstant;
  langCode = localStorage.getItem('language') ? localStorage.getItem('language') : 'en';
  //////////////////////////////

  breadcrumbObj: BreadCrumb = new BreadCrumb({
    heading: this.langData[this.langCode].KHAO_SAT_DOANH_NGHIEP,
    listBreadcrumb: [{
      title: this.langData[this.langCode].DANH_MUC,
      link: UrlConstant.ROUTE.MANAGEMENT.CATEGORIES
    }]
  });

  modalData: ModalData<CauHoiKhaoSatDoanhNghiep> = new ModalData<CauHoiKhaoSatDoanhNghiep>();
  listCauHoi: Paginate<CauHoiKhaoSatDoanhNghiep> = new Paginate<CauHoiKhaoSatDoanhNghiep>();
  listLoaiCauHoi = [
    { key: this.langData[this.langCode].CHON_MOT, value: 'CHON_MOT' },
    { key: this.langData[this.langCode].CHON_NHIEU, value: 'CHON_NHIEU' },
    { key: this.langData[this.langCode].SAP_XEP, value: 'SAP_XEP' },
    { key: this.langData[this.langCode].NHAP_LIEU, value: 'NHAP_LIEU' },
  ];
  searchValue = '';


  constructor(
    private spinner: NgxSpinnerService,
    private alert: ToastrService,
    private nzModalSvc: NzModalService,
    private cauHoiSvc: CauHoiKhaoSatDoanhNgiepService,
  ) { }

  ngOnInit(): void {
    this.getDataPaging();
  }

  getDataPaging(): void {
    this.spinner.show();
    this.cauHoiSvc.getAllPaging(
      this.listCauHoi.currentPage - 1,
      this.listCauHoi.limit,
      this.searchValue)
      .subscribe(res => {
        this.listCauHoi.currentPage = res.pageable.pageNumber + 1;
        this.listCauHoi.limit = res.pageable.pageSize;
        this.listCauHoi.totalPage = res.totalPages;
        this.listCauHoi.totalItem = res.totalElements;
        this.listCauHoi.data = res.content;
        this.spinner.hide();
      }, () => this.spinner.hide());
  }

  openModal(template: TemplateRef<unknown>, data?: CauHoiKhaoSatDoanhNghiep): void {
    if (data) {
      this.modalData.action = SystemConstant.ACTION.EDIT;
      this.modalData.data = data;
    } else {
      this.modalData.action = SystemConstant.ACTION.ADD;
    }
    this.nzModalSvc.create({
      nzStyle: { top: '20px' },
      nzWidth: 600,
      nzTitle: (data ? this.langData[this.langCode].CHINH_SUA_TITLE :
        this.langData[this.langCode].THEM_MOI_TITLE) + this.langData[this.langCode].CAU_HOI_KHAO_SAT_DOANH_NGHIEP,
      nzContent: template,
      nzFooter: null,
      nzMaskClosable: false
    });
  }

  closeModal(reload?: boolean): void {
    if (reload) {
      this.getDataPaging();
    }
    this.nzModalSvc.closeAll();
  }

  pageChange(page: Paginate<CauHoiKhaoSatDoanhNghiep>): void {
    this.listCauHoi = page;
    this.getDataPaging();
  }


  changeStatus(id: string): void {
    this.nzModalSvc.confirm({
      nzWidth: 300,
      nzTitle: this.langData[this.langCode].XAC_NHAN_THAY_DOI_TRANG_THAI,
      nzCancelText: this.langData[this.langCode].HUY,
      nzOkDanger: true,
      nzOkText: this.langData[this.langCode].XAC_NHAN,
      nzOnOk: () => {
        this.spinner.show();
        this.cauHoiSvc.delete(id)
          .subscribe(() => {
            this.spinner.hide();
            this.alert.success(this.langData[this.langCode].THAY_DOI_THANH_CONG);
            this.getDataPaging();
            this.spinner.hide();
          }, () => this.spinner.hide());
      }
    });
  }

  findLoaiCauHoi(role) {
    const result = this.listLoaiCauHoi.find((r) =>
      r.value == role);
    return result;
  }

}
