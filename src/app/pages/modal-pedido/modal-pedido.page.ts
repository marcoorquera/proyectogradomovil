import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { ProductoService } from 'src/app/services/producto.service';
import { PedidosListPage } from '../pedidos-list/pedidos-list.page';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { isNgTemplate } from '@angular/compiler';
import { ValueAccessor } from '@ionic/angular/directives/control-value-accessors/value-accessor';
@Component({
  selector: 'app-modal-pedido',
  templateUrl: './modal-pedido.page.html',
  styleUrls: ['./modal-pedido.page.scss'],
})
export class ModalPedidoPage implements OnInit {
  @Input() nombre;
  @Input() proveedor;
  @Input() descripcion;
  @Input() categoria_prod;
  @Input() precio;
  @Input() cantidad;
  @Input() image;
  @Input() id;
  @Input() nombre_empresa;

  isDisabled = false;
  isDisabled_resta = false;
  isDisabled_suma = false;
  pedido: number = 1;
  total_prod:number = 0;
  user_id: string;

  productos = [];
  prepedidos: unknown[];
  constructor(
    private modalCrtl: ModalController,
    private alertCtrl: AlertController,
    private prodServ: ProductoService,
    private auth: AngularFireAuth,
    private afs: AngularFireDatabase
  ) { }

  ngOnInit() {
    this.auth.onAuthStateChanged(user => {
      this.user_id = user.uid
      this.total_prod = Math.round((this.pedido * this.precio)*100)/100
      console.log("modal pedidos nombre empresa",this.nombre_empresa)
    })
  }

  

  suma(){
    let stock = 1;
    stock = this.cantidad - this.pedido;
    //console.log("stock: "+stock)
    this.pedido = this.pedido + 1
    //console.log("pedido: "+this.pedido)
    //return Math.round(num * 100) / 100 ;
    this.total_prod = Math.round((this.pedido * this.precio)*100)/100
    //console.log("total"+this.total_prod)
    /*
      if((stock -1) == 0){
      console.log("stock agotado")
      this.isDisabled = true;
      this.emptyStock()
    }
    */
    
  }

  resta(){
    let stock = 1;
    this.pedido = this.pedido - 1    
    
    //console.log("decremento: "+this.pedido)
    stock = this.cantidad - this.pedido
    if((this.pedido -1 ) <= 0){
      
      this.pedido = 1
    }
    this.total_prod = Math.round((this.pedido * this.precio)*100)/100
  }
  pedidoExiste
  cantidad_nuevo
  id_prepe
   contactoEmpresa(id_usuario, nombre_producto, precio, cantidad, imagen, subtotal){

    this.auth.onAuthStateChanged(user => {
        this.prodServ.obtenerPrepedidos(id_usuario).subscribe( async (prod) => {
          this.pedidoExiste= await prod.filter((value) => value.id_prod == this.id)
          console.log('lenght',this.pedidoExiste.length)
          if(this.pedidoExiste.length===0){
            // this.prodServ.addeditPedidos(user.uid, this.nombre_empresa ,this.id, this.categoria_prod, nombre_producto,precio, cantidad, imagen, subtotal,this.precio)
          }else{
            this.pedidoExiste.map(item=>{
              this.cantidad_nuevo=item.cantidad_pedido
              this.id_prepe=item.id_prepedido
              

                console.log('si hay')

              
            })
            const nuevocant=this.cantidad_nuevo+cantidad
            console.log(this.cantidad_nuevo,'nuevo',this.id_prepe)
            // await this.afs.object('prepedido/'+user.uid+'/'+ this.id_prepe+'/').update({
            //   cantidad_pedido:this.cantidad_nuevo+cantidad 
            // })
          }
          
          //   this.vendedores = this.vendedores.filter(
          //   (value) => value.nombre_empresa == item.empresa_pedido
          // );
          //console.log('ehloo',prod)
          // prod.map(item=>{
          //   if(this.pedidoExiste){
          //     console.log('si existe',id)
          //   }
          // })
          //this.pedidoExiste=this.pedidoExiste.filter((value) => value.id_prod == id)
    
          
          //console.log('pedidoExiste',this.pedidoExiste)
          // prod.map((ite) => {
          //   console.log('prod',prod)
          //   console.log('id',ite.id_prod==id,ite.id_prod,id)
          //   if(ite.id_prod==id){
          //     var prueba=cantidad+ite.cantidad_pedido
          //     console.log('cantidad',prueba)
          //     // this.afs.database.ref('/prepedido/' + id_usuario + '/' + id).update({
          //     //   cantidad_pedido: prueba
          //     // });
          //   }else{
              
              
          //   }
            
    
          // });
        });
    
        // this.prodServ.obtenerPrepedidos(user.uid).subscribe((prod) => {
        //   prod.map((ite) => {
        //     console.log('id',ite.id_prod==this.id,ite.id_prod,this.id)
        //     if(ite.id_prod==this.id){
        //       cantidad=cantidad+ite.cantidad_pedido
        //       console.log('cantidad',cantidad)
        //       // this.afs.database.ref('/prepedido/' + id_usuario + '/' + this.id).update({
        //       //   cantidad_pedido: cantidad
        //       // });
        //     }else{
              
        //     }

            
  
        //   });
        // });
       
        this.prodServ.addeditPedidos(user.uid, this.nombre_empresa ,this.id, this.categoria_prod, nombre_producto,precio, cantidad, imagen, subtotal,this.precio)
           
      //console.log(user.uid, this.nombre_empresa ,this.id, this.categoria_prod, nombre_producto,precio, cantidad, imagen, subtotal)
      
          
    
      

     })

     this.pedido_guardado()
     this.modalCrtl.dismiss()
     
     
    
  }

  async pedido_guardado() {
//     this.nombre='';
// this.proveedor='';
// this.descripcion='';
// this.categoria_prod='';
// this.precio='';
// this.cantidad='';
// this.image='';
// this.id='';
// this.nombre_empresa='';
    const alert = await this.alertCtrl.create({
      header: 'Pedido guardado',
      message: 'Producto añadido al pedido.',
      buttons: ['OK']
    });

    await alert.present();
  }


  async emptyStock() {
    const alert = await this.alertCtrl.create({
      header: 'Stock Agotado',
      subHeader: 'Lo sentimos',
      message: 'El stock se ha acabado.',
      buttons: ['OK']
    });

    await alert.present();
  }

  exit(){
    this.modalCrtl.dismiss()
  }

  

  // async validationExit(){
   
  //   if( this.sub_TotalFinal.length){
  //     this.salir()
  //   }else{
  //     this.modalCtrl.dismiss() 
  //   }
    
    
  // }


}
