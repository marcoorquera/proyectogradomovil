import { Component, OnInit, ɵAPP_ID_RANDOM_PROVIDER } from '@angular/core';

import { ModalController, NumericValueAccessor } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { ProductoService } from 'src/app/services/producto.service';
import { VendedorService } from 'src/app/services/vendedor.service';
import {AngularFireDatabase, AngularFireList} from '@angular/fire/compat/database'
import { map } from 'rxjs/operators';
import { ModalPedidoPage } from '../modal-pedido/modal-pedido.page';
import { ProductInfoPage } from '../product-info/product-info.page';
import { Observable } from 'rxjs';
import { ModalInfoPage } from '../modal-info/modal-info.page';
import { PedidosListPage } from '../pedidos-list/pedidos-list.page';
import { AngularFireAuth } from '@angular/fire/compat/auth';
@Component({
  selector: 'app-modal-search',
  templateUrl: './modal-search.page.html',
  styleUrls: ['./modal-search.page.scss'],
})
export class ModalSearchPage implements OnInit {

  productList: AngularFireList<any>
  prodCategoryList: AngularFireList<any>

  empresasEnable: boolean = true;
  CategoriasEnable: boolean = true;
  productosEnable: boolean = true;
  producto: boolean = true;


  itemRef: AngularFireList<any>;
  item: Observable<any[]>;
  data: Observable<any[]>;
  resultadosHidden: boolean = true;
  prepedidosFiltrExist: any[];
  prepedidosFiltr: any[];
  prepedidosExistAngularList: AngularFireList<any>
  filtrPrepedidosExist: any[];
  filtrPrepedidos: any[];
  prepedidosAngularList: AngularFireList<any>
  observador: boolean = true;

  categorias = []
  busqueda =[];
  productos = [];
  duplicados = [];
  categoria_buscar = [];
  categoriaprod = [];
  proveedores = [];
  uniqueprods = [];
  textoBuscarCat = '';
  textoBuscar = '';
  textoBuscarProd= '';
  empresa_producto='';
  image_empresa='';
  constructor(
    private modalCtrl: ModalController,
    public alertController: AlertController,
    public vendedorService: VendedorService,
    public productService: ProductoService,
    private afs: AngularFireDatabase,
    private auth: AngularFireAuth,
    private prodServ: ProductoService,
  ) { }

  ngOnInit() {
    this.showEmpresas();
    this.showProductos();
    this.showProductCategory();
    this.prepedidosExist();
  }

  async CategorySelected(image, categoria, empresa){
    const modal = await this.modalCtrl.create({
      component: ProductInfoPage,
      componentProps: {
        nombre_categoria: categoria,
        img_empresa: image,
        nom_empresa: empresa
      }
    })
    return await modal.present()
  }

  buscarProducto(event){
    this.resultadosHidden = false;
    this.textoBuscarProd = event.detail.value;

  }

  buscarCategory(event){
    this.textoBuscarCat = event.detail.value;
    console.log("busqueda: "+this.textoBuscarCat)
  }
  buscar(event: CustomEvent){
    this.textoBuscar = event.detail.value;
    console.log("busqueda: "+this.textoBuscar)
  }

  showEmpresas(){
    this.empresasEnable = false;
    this.CategoriasEnable = true;
    this.productosEnable = true;
    this.vendedorService.getVendedor().subscribe(
      list => {
        this.proveedores = list.map(item => {
          return {
            $key: item.key,
            ...item.payload.val()
          }
        })
        this.proveedores.map(item => {
          item.nombre_empresa,
          item.image_vendedor,
          item.direccion_vendedor,
          item.telefono_vendedor,
          item.uid_vendedor
        })
        
      }
    )
  }

  async detailCategoria(image, categoria, empresa){
    const modal = await this.modalCtrl.create({
      component: ModalInfoPage,
      componentProps: {
        categoria: categoria,
        image: image,
        empresa: empresa,
      }
    })
    return await modal.present()
  }

  async showDetailesProds( id_empresa, image_empresa, nombre_empresa){
    const modal = await this.modalCtrl.create({
      component: ProductInfoPage,
      componentProps: {
        id: id_empresa,
        img_empresa: image_empresa,
        nom_empresa: nombre_empresa
        
      }
    })
    return await modal.present();
  }

  async modalPedido(nombre_producto,nombre_proveedor, descripcion_producto, categoria_producto, cantidad_producto, precio_producto, uid_user,image_producto, empresa_proveedor, id_prod,image_empresa){
    this.empresa_producto=empresa_proveedor;
    this.image_empresa=image_empresa;
    const modal = await this.modalCtrl.create({
      component: ModalPedidoPage,
      componentProps: {
        nombre: nombre_producto,
        proveedor: nombre_proveedor,
        descripcion: descripcion_producto,
        cantidad: cantidad_producto,
        precio: precio_producto, 
        id_user: uid_user,
        image: image_producto,
        nombre_empresa:empresa_proveedor, 
        id: id_prod,
        categoria_prod:categoria_producto
      }
    })
    this.prepedidosExist()
    return await modal.present();
  }

  prepedidos
  prepedidosExist(){
   
    this.auth.onAuthStateChanged(user => {
       this.afs.list('prepedido/'+user.uid+"/").valueChanges().subscribe(data=>{
          this.prepedidos=data
         
          console.log("verificando si exite prepedidos",this.prepedidos.imagen_empresa)
          if (this.prepedidos.length == 0) {
            document.getElementById('boton_pedido').style.display = 'none';
          } else {
            document.getElementById('boton_pedido').style.display = 'block';
          }
      })
      
      
    })
    
      
  }

  showProductCategory(){
    this.CategoriasEnable = false;
    this.empresasEnable = true;
    this.productosEnable = true; 
    this.prodCategoryList = this.afs.list('categoria_productos/');
    this.prodCategoryList.snapshotChanges().subscribe(
      list => {
        this.categoriaprod = list.map(item => {
          return {
            $key: item.key,
            ...item.payload.val()
          }
        })
        //console.log("categoria_prod: "+this.categoriaprod[0])
        this.categoriaprod.map(item => {
          item.categoria,
          item.empresa,
          item.image_empresa
          item.codigo_categoria          
        }
        )
        console.log("categoria_prod: "+this.categoriaprod)
        this.duplicados = Array.from(this.categoriaprod.reduce((map, obj) => map.set(obj.codigo_categoria, obj), new Map()).values())
        this.categoria_buscar = Array.from(this.categoriaprod.reduce((map, obj) => map.set(obj.codigo_categoria, obj), new Map()).values())
        if(this.categoria_buscar){

        }
        
        this.categoria_buscar.map(item => {
          console.log("categoria_prod: "+ item.codigo_categoria)
        })
      
        /*
        this.duplicados =  this.categoriaprod.filter(arreglo => arreglo.categoria === 'veladores')
        this.duplicados.filter(duplicado => {
          console.log("duplicad: "+duplicado.categoria+" empresa: "+duplicado.empresa)
        })
        */
      }
    )
  }
  
  

  showProductos(){
    this.productosEnable = false;
    this.CategoriasEnable = true;
    this.empresasEnable = true;
    this.productList = this.afs.list('/producto');
    this.productList.snapshotChanges().subscribe(
      list => {
        this.productos = list.map(item => {
          return {
            $key: item.key,
            ...item.payload.val()
          }
        })
        this.productos.map(item => {
          item.nombre_producto,
          item.empresa_proveedor,
          item.categoria_producto,
          item.cantidad_producto,
          item.descripcion_producto,
          item.id_prod,
          item.precio_producto,
          item.uid_user,
          item.image_producto,
          item.image_empresa
          
        })
      }
    )
    

    /*
      this.productService.getProduct().subscribe(data => {
      data.map((item) => {
        this.productos.push({
          nombre: item.nombre_producto,
          descripcion: item.descripcion_producto,
          categoria: item.categoria_producto,
          empresa: item.empresa_proveedor,
          precio: item.precio_producto,
          cantidad: item.cantidad_producto,
          imagen: item.image_producto,
          uid_user: item.uid_user,
          id_prod: item.id_prod
        })
        this.uniqueprods = this.productos.filter((element, index) => {
          return this.productos.indexOf(element) === index;
        })
      })
    })
    
    */
    
  }


  async goToPedidoList(){
    //console.log("empresa1: "+this.nom_empresa)
    const modal = await this.modalCtrl.create({
      component: PedidosListPage,
      componentProps: {
        producto: this.producto,
        empresa_prepedido: this.empresa_producto,
        imagen_empresa:this.image_empresa
      }
    })
    await modal.present()
  }
  
  async validationExit(){
    console.log("verificando si exite prepedidos",this.prepedidos.length)
    if(this.prepedidos.length){
      this.salir()
    }else{
      this.modalCtrl.dismiss() 
    }
    
    
  }
  

  async salir(){
    const alert = await this.alertController.create({
      animated: true,
      cssClass: 'alert',
      header: '¿Seguro que desea salir?',
      message: 'Al salir su pedido se eliminará',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Ok',
          role: 'ok',
          handler: () => {

            this.auth.onAuthStateChanged(user => { 
            
         
                  console.log("estoy en el if del ok para eliminar")
                  
                  this.prodServ.deleteprepedidos(user.uid)})

                  
                  
                
            
            this.modalCtrl.dismiss()
            //location.reload();
          }
        }
        
        
      ]

    })
    
    await alert.present();
    //this.modalCtrl.dismiss();
    
  }
  


}
