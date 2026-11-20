import com.android.apksig.ApkSigner;
import java.io.*;import java.security.*;import java.security.cert.X509Certificate;import java.util.*;
public class Sign{public static void main(String[] a)throws Exception{
  KeyStore ks=KeyStore.getInstance("PKCS12");char[] pw=a[3].toCharArray();ks.load(new FileInputStream(a[2]),pw);
  PrivateKey k=(PrivateKey)ks.getKey("seyr",pw);X509Certificate c=(X509Certificate)ks.getCertificate("seyr");
  ApkSigner.SignerConfig sc=new ApkSigner.SignerConfig.Builder("seyr",k,List.of(c)).build();
  new ApkSigner.Builder(List.of(sc)).setInputApk(new File(a[0])).setOutputApk(new File(a[1])).setMinSdkVersion(24)
    .setV1SigningEnabled(false).setV2SigningEnabled(true).build().sign();}}
