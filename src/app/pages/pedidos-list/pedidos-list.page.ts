import { Component, OnInit, Input } from '@angular/core';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { ProductoService } from 'src/app/services/producto.service';
import { AngularFireDatabase, AngularFireDatabaseModule, AngularFireList } from '@angular/fire/compat/database';
import { ProductInfoPage } from '../product-info/product-info.page';
import { PedidoFinalPage } from '../pedido-final/pedido-final.page';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { alertController } from '@ionic/core';
import { VendedorService } from 'src/app/services/vendedor.service';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-pedidos-list',
  templateUrl: './pedidos-list.page.html',
  styleUrls: ['./pedidos-list.page.scss'],
})
export class PedidosListPage implements OnInit {

  @Input() empresa_prepedido;
  @Input() imagen_empresa
  pedidos = []
  subtotal = []
  sub = 0;
  pedidos_duplicados = []

  cantidad_pedido: number = 0;
  sub_TotalFinal = null;
  nombre_empresa_pedido: string;
  user_id: string;

  //prepedidos
  prepedidosFiltr: any[];
  prepedidosAngularList: AngularFireList<any>
  filtrPrepedidos: any[];

  //subtotal
  subtotalFiltr: any[];
  subtotalAngularFireList: AngularFireList<any>
  filtrSubtotal: any[];

  constructor( private navCtrl: NavController,
    private modalCtrl: ModalController,
    private productService: ProductoService,
    private afs: AngularFireDatabase,
    private auth: AngularFireAuth,
    private alertCtrl: AlertController,
    private VendedorServ: VendedorService) { }

  ngOnInit() {

    this.auth.onAuthStateChanged(user => {
      this.user_id = user.uid
      this.showPrepedidos()
      
    })


    // this.PrepedidosExist()

    //this.subTotalFinal()
  }



  notfunction() {
    this.pedidos = []
    this.productService.geteditPedidos().subscribe(data => {
      data.map((item) => {
        if (item.empresa === this.empresa_prepedido) {
          this.nombre_empresa_pedido = item.empresa
          //console.log("nombre empresa: "+item.empresa+" empresa: "+this.empresa_prepedido)
          this.pedidos.push({
            nombre_pedido: item.nombre_pedido,
            precio: (item.precio_pedido * item.cantidad_pedido),
            categoria: item.categoria_pedido,
            cantidad: item.cantidad_pedido,
            empresa: item.empresa,
            imagen: item.imagen_pedido,
            id: item.id_prepedido,
            id_prod: item.id_prod,
            subtotal: item.subtotal
          })

          this.pedidos_duplicados = Array.from(this.pedidos.reduce((map, obj) => map.set(obj.nombre_pedido, obj), new Map()).values())
          //poner aqui subtotal
          this.pedidos_duplicados.map((data => {
            console.log("data;===> ", data.subtotal)

            //this.sub_TotalFinal = 0;
            //let subtotal = parseFloat(data.subtotal)
            //this.subtotal.push(data.subtotal)
            //console.log("subtotal_productos: "+this.subtotal)
            //this.sub_TotalFinal = this.subtotal.reduce((a,b) => a+b, 0)
            //console.log("suma: "+this.sub_TotalFinal) 
          }))



        }
      })
    })
  }
  listadoProducto
  showPrepedidos() {
    this.auth.onAuthStateChanged(user => {
      this.afs.list('prepedido/' + user.uid + "/").valueChanges().subscribe(data => {

        this.listadoProducto = data
        console.log("el valor de lso datos son ", this.listadoProducto)
        if (this.listadoProducto.length == 0) {
          this.modalCtrl.dismiss();
          document.getElementById('boton_pedido').style.display = 'none';
        } else {
          document.getElementById('boton_pedido').style.display = 'block';
        }
      })
      
      this.prepedidosAngularList = this.afs.list('prepedido/'+ user.uid + "/")
      this.prepedidosAngularList.snapshotChanges().subscribe(
        list => {
          

          this.prepedidosFiltr = list.map(item => {
            return{
              $key: item.key,
              ...item.payload.val()
            }
          })
          console.log("nombre empresa: "+this.empresa_prepedido)
          this.filtrPrepedidos = this.prepedidosFiltr.filter(value => value.empresa === this.empresa_prepedido)
          this.pedidos_duplicados = Array.from(this.filtrPrepedidos.reduce((map, obj) => map.set(obj.nombre_pedido, obj), new Map()).values())
          this.sub_TotalFinal = this.pedidos_duplicados.map(data => data.subtotal).reduce((sum, current) => sum + current, 0)
         
        }
      )

    })

    
  }

  // prepedidos
  // PrepedidosExist(){
  //   this.auth.onAuthStateChanged(user => {
  //     console.log("uid: "+user.uid)
  //      this.afs.list('prepedido/'+user.uid+"/").valueChanges().subscribe(data=>{
  //         this.prepedidos=data
  //     })


  //   })


  // }

  suma(id, cantidad, categoria, empresa, id_prod, imagen, nombre, precio) {
    this.sub = 0;
    this.subtotal = [];
    this.sub_TotalFinal = 0;
    //console.log("nombre: "+nombre_selected)
    console.log("id_prepedido: " + id)
    console.log("cantidad: " + cantidad)
    console.log("categoria: " + categoria)
    console.log("id_prd: " + id_prod)
    console.log("imagen: " + imagen)
    console.log("nombre: " + nombre)


    const division = precio / cantidad
    cantidad = cantidad + 1
    console.log("division: " + division)
    console.log("cantidad: " + cantidad)
    console.log("subtotal: " + division + "/" + cantidad)
    const subtotal = division * cantidad
    this.pedidos = []
    this.afs.database.ref('/prepedido/' + id).update({
      cantidad_pedido: cantidad,
      categoria_pedido: categoria,
      empresa: empresa,
      id_prepedido: id,
      id_prod: id_prod,
      imagen_pedido: imagen,
      nombre_pedido: nombre,
      precio_pedido: division,
      subtotal: subtotal
    })


  }

  resta(id, cantidad, categoria, empresa, id_prod, imagen, nombre, precio) {
    //console.log("nombre: "+nombre_selected)
    const division = precio / cantidad
    cantidad = cantidad - 1
    console.log("division: " + division)
    console.log("cantidad: " + cantidad)
    console.log("subtotal: " + division + "/" + cantidad)
    const subtotal = division * cantidad

    this.afs.database.ref('/prepedido/' + id).update({
      cantidad_pedido: cantidad,
      categoria_pedido: categoria,
      empresa: empresa,
      id_prepedido: id,
      id_prod: id_prod,
      imagen_pedido: imagen,
      nombre_pedido: nombre,
      precio_pedido: division,
      subtotal: subtotal
    })
    this.pedidos = []
    this.sub_TotalFinal = null;

  }


  
  
   async guardarPedidos() {
  
  console.log("entrando a guardar el pedido")
    this.auth.onAuthStateChanged(user => {
    
      
      this.productService.obtenerPrepedidos(user.uid).subscribe(data => {
        
        data.map((valores) => { 
          

          const subtotal = valores.precio_pedido * valores.cantidad_pedido;
          this.productService.addPedidoFinal(valores.id_usuario, valores.id_prepedido, valores.nombre_pedido, subtotal, valores.categoria_pedido, valores.cantidad_pedido, valores.empresa, valores.imagen_pedido, valores.id_prod, subtotal, this.imagen_empresa)
          
            this.productService.deleteprepedidos(user.uid)
            
          
         
       
        })
       
      })
          
      this.pedidoGuardado()
     
      
      
    })
    
    }
           
    

    //console.log("guardando pedidos ", empresa) 

  
  deletePrepedidos(uid, id_prepedido) {
    console.log("eliminando prepedido")

    this.afs.database.ref('/prepedido/' + uid + "/" + id_prepedido).remove()

  }
  async viewdataTienda() {
    const modal = this.modalCtrl.create({
      component: PedidoFinalPage,
      componentProps: {
        nombre_empresa: this.empresa_prepedido,
        imagen_empresa: this.imagen_empresa

      }
    })

    
    return (await modal).present();
  }
  seguirComprando() {
    this.modalCtrl.dismiss();
  }

  async pedidoGuardado() {
   
    const alert = await this.alertCtrl.create({
      animated: true,
      cssClass: 'success',
      header: 'Pedido guardado',
      message: 'Su pedido se ha hecho satisfactoriamente',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Ok',
          role: 'ok',
          handler: () => {

        
        this.modalCtrl.dismiss()
       
       
       
            this.viewdataTienda()
           
            
            
  this.goToPedidos()

          }
        }]

    })
    await alert.present();
  }

  delete(id) {
    this.auth.onAuthStateChanged(user => {

      this.afs.database.ref('/prepedido/' + user.uid + "/" + id).remove()

    })



  }

  salir() {
    this.modalCtrl.dismiss()

  }

async validationExit(){
   
    if( this.listadoProducto.length>0){
      console.log("entrando a validExit o finalizar pedido")
      this.guardarPedidos()
      
     
    }else{
      this.salir()
    
    }
    
    
  }

  goToPedidos(){
    this.navCtrl.navigateForward("/menu/pedido")
  }
}
